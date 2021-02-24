const { DateTime, Duration } = require('luxon');

module.exports = {
	enrichCalls: (callsResponse, teamsResponse, usersResponse) => {
		let enriched = {}

		const enrichedCalls = callsResponse.map(call => {
			const enrichedCall = { ...call };
			const team = teamsResponse.find(team => team.team_id === enrichedCall.team_id);
			if (team) {
				enrichedCall.team = team;
			}
	
			const userIdsInCall = enrichedCall.participants.map(p => p.user_id);
			const participants = usersResponse.filter(user => userIdsInCall.includes(user.user_id));
			enrichedCall.participants = participants.map(p => p.first_name + " " + p.last_name);
	
			enrichedCall.flagged = enrichedCall.duration < (2 * 60 * 1000);
			return enrichedCall;
		});
	
		if (enrichedCalls.length > 0) {
			const starts = enrichedCalls.map(c => DateTime.fromISO(c.started_at).toMillis());
	
			const newMin = DateTime.fromMillis(Math.min(...starts)).startOf('day').toMillis();
			const newMax = DateTime.fromMillis(Math.max(...starts)).endOf('day').toMillis() + 1;
	
			const newDay = DateTime.fromMillis(newMax - 1).startOf('day').toMillis();
	
			const newDuration = Duration.fromMillis(newMax - newMin).as('days');
	
			const newDays = [];
			for (let i = 0; i < newDuration; i += 1) {
				newDays.push(newMin + (24 * 60 * 60 * 1000 * i));
			}
	
			const callsGroupedByDay = newDays.map(d => {
				return enrichedCalls.filter(call => DateTime.fromISO(call.started_at).startOf('day').toMillis() === d);
			});
	
			const newVolumes = callsGroupedByDay.map(calls => calls.length);
			const newFlags = callsGroupedByDay.map(calls => calls.filter(call => call.flagged).length > 0);
	
			const newMaxCallVolume = Math.max(...newVolumes);
	
			enriched = {
				calls: enrichedCalls,
				duration: newDuration,
				currentDayMillis: newDay,
				allDaysMillis: newDays,
				volumes: newVolumes,
				flags: newFlags,
				maxCallVolume: newMaxCallVolume,
				min: newMin,
				max: newMax
			};
		}

		return enriched;
	}
}