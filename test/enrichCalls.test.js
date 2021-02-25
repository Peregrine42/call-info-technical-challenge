const {expect} = require('chai');
const {describe} = require('mocha');
const {Duration, DateTime} = require('luxon');
const {enrichCalls} = require('../src/enrichCalls');

describe('#enrichCalls', () => {
	it('adds team data to the given list of calls', () => {
		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'team_id': 14,
			},
		];

		const teamsData = [
			{
				'team_id': 14,
				'logo': 'http://placehold.it/32x32',
			},
			{
				'team_id': 42,
				'logo': 'wrong-team.png',
			},
		];

		const {calls} = enrichCalls(existingCalls, teamsData);
		expect(calls[0].team.logo).to.equal('http://placehold.it/32x32');
	});

	it(`
		adds participant names to the given list of calls,
		ignoring missing names
	`, () => {
		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'participants': [
					{user_id: 1},
					{user_id: 2},
					{user_id: 3},
				],
			},
		];

		const usersData = [
			{
				'user_id': 1,
				'first_name': 'A',
				'last_name': 'B',
			},
			{
				'user_id': 2,
				'first_name': 'C',
				'last_name': 'D',
			},
		];

		const {calls} = enrichCalls(existingCalls, [], usersData);
		expect(calls[0].participants).to.deep.equal(['A B', 'C D']);
	});

	it('calculates the duration between the first call and the last call', () => {
		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': '2020-01-01',
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': '2020-01-02',
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': '2020-01-03',
			},
		];

		const {duration} = enrichCalls(existingCalls);
		expect(duration).to.deep.equal(3);
	});

	it(`
		returns the initially currently selected day, in milliseconds: 
		the last day in the list
	`, () => {
		const dayOne = DateTime.fromISO('2020-01-01');
		const dayTwo = DateTime.fromISO('2020-01-02');
		const dayThree = DateTime.fromISO('2020-01-03');

		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayTwo.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayThree.toISO(DateTime.DATETIME_FULL),
			},
		];

		const {currentDayMillis} = enrichCalls(existingCalls);
		expect(currentDayMillis).to.equal(dayThree.toMillis());
	});

	it('returns all the days between the max and the min in milliseconds', () => {
		const dayOne = DateTime.fromISO('2020-01-01');
		const dayTwo = DateTime.fromISO('2020-01-02');
		const dayThree = DateTime.fromISO('2020-01-03');

		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayTwo.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayThree.toISO(DateTime.DATETIME_FULL),
			},
		];

		const {allDaysMillis} = enrichCalls(existingCalls);
		expect(allDaysMillis).to.deep.equal([
			dayOne.toMillis(),
			dayTwo.toMillis(),
			dayThree.toMillis(),
		]);
	});

	it('returns the call volumes for each day', () => {
		const dayOne = DateTime.fromISO('2020-01-01');
		const dayThree = DateTime.fromISO('2020-01-03');

		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayThree.toISO(DateTime.DATETIME_FULL),
			},
		];

		const {volumes} = enrichCalls(existingCalls);
		expect(volumes).to.deep.equal([3, 0, 1]);
	});

	it('flags any call under two mins in duration', () => {
		const dayOne = DateTime.fromISO('2020-01-01');
		const dayTwo = DateTime.fromISO('2020-01-02');
		const dayThree = DateTime.fromISO('2020-01-03');

		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
				'duration': Duration.fromObject({hours: 1}).toMillis(),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayTwo.toISO(DateTime.DATETIME_FULL),
				'duration': Duration.fromObject({minutes: 2}).toMillis(),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayThree.toISO(DateTime.DATETIME_FULL),
				'duration': Duration.fromObject({seconds: 119}).toMillis(),
			},
		];

		const {flags, calls} = enrichCalls(existingCalls);
		expect(calls[0].flagged).to.equal(false);
		expect(calls[1].flagged).to.equal(false);
		expect(calls[2].flagged).to.equal(true);
		expect(flags).to.deep.equal([
			false,
			false,
			true,
		]);
	});

	it('finds the maximum number of calls recorded in one day', () => {
		const dayOne = DateTime.fromISO('2020-01-01');
		const dayThree = DateTime.fromISO('2020-01-03');

		const existingCalls = [
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayOne.toISO(DateTime.DATETIME_FULL),
			},
			{
				'call_id': '30960045-a443-4fcc-9a0c-5935809cb193',
				'started_at': dayThree.toISO(DateTime.DATETIME_FULL),
			},
		];

		const {maxCallVolume} = enrichCalls(existingCalls);
		expect(maxCallVolume).to.deep.equal(3);
	});
});
