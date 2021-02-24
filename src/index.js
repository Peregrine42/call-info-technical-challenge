// @flow
const fs = require('fs').promises;
const { DateTime, Duration } = require('luxon');

const express = require('express');
const app = express();
const port = 8080;

let enriched = {
	calls: [],
	currentDayMillis: null,
	allDaysMillis: [],
	volumes: [],
	flags: [],
	duration: 0,
	maxCallVolume: 0
};

app.get('/calls', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(enriched));
});

app.use('/', express.static('static'));

app.listen(port, async () => {
	console.log('Loading files...')

	const callsFile = await fs.readFile('./data/calls.json');
	const teamsFile = await fs.readFile('./data/teams.json');
	const usersFile = await fs.readFile('./data/users.json');

	const callsResponse = JSON.parse(callsFile.toString());
	const teamsResponse = JSON.parse(teamsFile.toString());
	const usersResponse = JSON.parse(usersFile.toString());

	console.log('Preprocessing files...')

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

		const newDay = newMax - 1;

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

	console.log(`App listening at http://localhost:${port}`);
});
