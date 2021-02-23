// @flow
const fs = require('fs').promises;
const express = require('express');
const app = express();
const port = 3000;

app.get('/calls', async (req, res) => {
	const content = await fs.readFile('./data/calls.json');
	res.setHeader('Content-Type', 'application/json');
	res.send(content);
});

app.get('/teams', async (req, res) => {
	const content = await fs.readFile('./data/teams.json');
	res.setHeader('Content-Type', 'application/json');
	res.send(content);
});

app.get('/users', async (req, res) => {
	const content = await fs.readFile('./data/users.json');
	res.setHeader('Content-Type', 'application/json');
	res.send(content);
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
