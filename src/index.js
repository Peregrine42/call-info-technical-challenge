// @flow
const fs = require('fs').promises;

const { enrichCalls } = require('./enrichCalls');

const express = require('express');
const app = express();
const port = 8080;

let enriched = {};

app.get('/calls', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(enriched));
});

app.use('/', express.static('static'));

app.listen(port, async () => {
	console.log('Loading files...');

	const callsFile = await fs.readFile('./data/calls.json');
	const teamsFile = await fs.readFile('./data/teams.json');
	const usersFile = await fs.readFile('./data/users.json');

	const callsJSON = JSON.parse(callsFile.toString());
	const teamsJSON = JSON.parse(teamsFile.toString());
	const usersJSON = JSON.parse(usersFile.toString());

	console.log('Preprocessing files...');
	enriched = enrichCalls(callsJSON, teamsJSON, usersJSON);
	console.log('Preprocessing complete.')

	console.log(`App listening at http://localhost:${port}`);
});
