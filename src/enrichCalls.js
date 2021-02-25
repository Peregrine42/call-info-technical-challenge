// @flow
const {DateTime, Duration} = require('luxon');

/* ::
interface EnrichedCallsResponse {
	calls: EnrichedCall[];
	duration: number;
	currentDayMillis: number;
	allDaysMillis: number[];
	volumes: number[];
	flags: boolean[];
	maxCallVolume: number;
	min: number;
	max: number;
}
*/

const enrichCalls = (
	callsResponse /* : Call[] */,
	teamsResponse /* : Team[] */,
	usersResponse /* : User[] */,
) /* : EnrichedCallsResponse */ => {
	let newDuration = 0;
	let newDay = 0;
	let newDays = [];
	let newVolumes = [];
	let newFlags = [];
	let newMaxCallVolume = 0;
	let newMin = 0;
	let newMax = 0;
	let enriched = {
		calls: [],
		duration: newDuration,
		currentDayMillis: newDay,
		allDaysMillis: newDays,
		volumes: newVolumes,
		flags: newFlags,
		maxCallVolume: newMaxCallVolume,
		min: newMin,
		max: newMax,
	};

	const enrichedCalls = callsResponse.map((call) => {
		const enrichedCall = ({...call} /* : any */);

		if (teamsResponse) {
			const team = findTeam(enrichedCall, teamsResponse);

			if (team) {
				enrichedCall.team = team;
			}
		}

		if (enrichedCall.participants) {
			enrichedCall.participants = findParticipants(enrichedCall, usersResponse);
		}

		if (enrichedCall.duration) {
			enrichedCall.flagged = checkForShortDurationCall(enrichedCall);
		}
		return enrichedCall;
	});

	if (enrichedCalls.length > 0) {
		const starts = enrichedCalls.map((c) => {
			return parseCallStart(c);
		});

		if (starts.length > 0) {
			newMin = DateTime
				.fromMillis(Math.min(...starts))
				.startOf('day')
				.toMillis();
			newMax = DateTime
				.fromMillis(Math.max(...starts))
				.endOf('day')
				.toMillis() + 1;

			newDay = DateTime.fromMillis(newMax - 1).startOf('day').toMillis();
			newDuration = Duration.fromMillis(newMax - newMin).as('days');
			newDays = generateDays(newMin, newDuration);

			const callsGroupedByDay = groupCallsByDay(newDays, enrichedCalls);

			newVolumes = callsGroupedByDay.map((calls) => calls.length);
			newFlags = callsGroupedByDay.map((calls) => {
				return calls.filter((call) => call.flagged).length > 0;
			});

			newMaxCallVolume = Math.max(...newVolumes);
		}

		enriched = {
			calls: enrichedCalls,
			duration: newDuration,
			currentDayMillis: newDay,
			allDaysMillis: newDays,
			volumes: newVolumes,
			flags: newFlags,
			maxCallVolume: newMaxCallVolume,
			min: newMin,
			max: newMax,
		};
	}

	return enriched;
};

const findTeam = (enrichedCall, teamsResponse) => {
	return teamsResponse.find((team) => {
		return team.team_id === enrichedCall.team_id;
	});
};

const findParticipants = (enrichedCall, usersResponse) => {
	const userIdsInCall = enrichedCall.participants
		.map((p) => p.user_id);
	const participants = usersResponse
		.filter((user) => userIdsInCall.includes(user.user_id));
	return participants
		.map((p) => p.first_name + ' ' + p.last_name);
};

const checkForShortDurationCall = (enrichedCall) => {
	return enrichedCall.duration < (2 * 60 * 1000);
};

const parseCallStart = (call) => {
	if (call.started_at) {
		return DateTime.fromISO(call.started_at).toMillis();
	} else {
		return 0;
	}
};

const generateDays = (newMin, newDuration) => {
	const newDays = [];
	for (let i = 0; i < newDuration; i += 1) {
		newDays.push(newMin + (24 * 60 * 60 * 1000 * i));
	}
	return newDays;
};

const groupCallsByDay = (newDays, calls) => {
	const callsGroupedByDay = newDays.map((d) => {
		return calls
			.filter((call) => {
				return (
					DateTime
						.fromISO(call.started_at)
						.startOf('day')
						.toMillis() === d
				);
			});
	});

	return callsGroupedByDay;
};

module.exports = {
	enrichCalls,
};
