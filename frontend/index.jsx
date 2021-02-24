// @flow

require('core-js/stable');
require('regenerator-runtime/runtime');

const React = require('react');
const { useEffect, useState, useMemo } = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios');
const classNames = require('classnames');
const { DateTime, Duration, Settings } = require('luxon');

function App() {
	const [calls, setCalls] = useState([]);
	const [day, setDay] = useState(null);
	const [filteredCalls, setFilteredCalls] = useState([]);
	const [max, setMax] = useState(0);
	const [min, setMin] = useState(0);
	const [width, setWidth] = useState(1000);
	const [duration, setDuration] = useState(0);
	const [days, setDays] = useState([]);
	const [volumes, setVolumes] = useState([]);
	const [flags, setFlags] = useState([]);
	const [maxCallVolume, setMaxCallVolume] = useState(0);

	useEffect(() => {
		async function getCalls() {
			const callsResponse = await axios.get('/calls');
			const teamsResponse = await axios.get('/teams');
			const usersResponse = await axios.get('/users');

			const newCalls = callsResponse.data.map(call => {
				const enrichedCall = { ...call };
				const team = teamsResponse.data.find(team => team.team_id === enrichedCall.team_id);
				if (team) {
					enrichedCall.team = team;
				}

				const userIdsInCall = enrichedCall.participants.map(p => p.user_id);
				const participants = usersResponse.data.filter(user => userIdsInCall.includes(user.user_id));
				enrichedCall.participants = participants.map(p => p.first_name + " " + p.last_name);

				enrichedCall.flagged = enrichedCall.duration < (2 * 60 * 1000);
				return enrichedCall;
			});

			setCalls(newCalls);

			if (newCalls.length > 0) {
				const starts = newCalls.map(c => DateTime.fromISO(c.started_at).toMillis());

				const newMin = DateTime.fromMillis(Math.min(...starts)).startOf('day').toMillis();
				const newMax = DateTime.fromMillis(Math.max(...starts)).endOf('day').toMillis() + 1;
				setMin(newMin);
				setMax(newMax);

				if (day === null) {
					setDay(newMax - 1);
				}

				setTimeout(() => {
					const newDuration = Duration.fromMillis(newMax - newMin).as('days');

					const newDays = [];
					for (let i = 0; i < newDuration; i += 1) {
						newDays.push(newMin + (24 * 60 * 60 * 1000 * i));
					}

					const callsGroupedByDay = newDays.map(d => {
						return newCalls.filter(call => DateTime.fromISO(call.started_at).startOf('day').toMillis() === d);
					});

					const newVolumes = callsGroupedByDay.map(calls => calls.length);
					const newFlags = callsGroupedByDay.map(calls => calls.filter(call => call.flagged).length > 0);

					const newMaxCallVolume = Math.max(...newVolumes);

					setDuration(newDuration);
					setDays(newDays);
					setVolumes(newVolumes);
					setFlags(newFlags);
					setMaxCallVolume(newMaxCallVolume);
				}, 0);
			}
		}

		getCalls().catch(e => { throw (e); });
	}, []);

	useEffect(() => {
		const filtered = calls.filter(c => {
			return DateTime.fromISO(c.started_at).hasSame(DateTime.fromMillis(day || 0), 'day');
		});

		filtered.sort((c1, c2) => {
			if (DateTime.fromISO(c1.started_at).toMillis() > DateTime.fromISO(c2.started_at).toMillis()) {
				return 1;
			} else {
				return -1;
			}
		});

		setFilteredCalls(filtered);
	}, [calls, day]);

	const callTableRows = useMemo(() => filteredCalls.map(call => {
		return (
			<tr key={call.call_id} className={classNames({ flagged: call.flagged })}>
				<td>{call.call_id}</td>
				<td>{DateTime.fromISO(call.started_at).toLocaleString(DateTime.DATETIME_MED)}</td>
				<td>{Duration.fromMillis(call.duration).toISOTime({ suppressMilliseconds: true })}</td>
				<td>{call.team && call.team.name}</td>
				<td>{call.participants.join(', ')}</td>
			</tr>
		);
	}), [filteredCalls]);

	const divs = useMemo(() => {
		let result = [];
		if (duration > 0) {
			console.log(maxCallVolume);
			result = days.map((d, i) => {
				const callVolume = volumes[i];
				const flagged = flags[i];
				const scale = callVolume / maxCallVolume;

				return (
					<div
						key={i}
						onClick={() => setDay(d)}
						className={classNames({ bar: true, flagged })}
						style={{
							left: (i * width / duration) + 'px',
							height: (50 * scale) + 'px'
						}}
					></div>
				);
			});
		}
		return result;
	}, [days, volumes, flags, maxCallVolume, duration, width]);

	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'end', width: (width) + 'px', height: '50px' }}>
				{divs}
			</div>
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Start Time</th>
						<th>Duration</th>
						<th>Team</th>
						<th>Participants</th>
					</tr>
				</thead>
				<tbody>
					{callTableRows}
				</tbody>
			</table>
		</div>
	);
}

(window: Window).addEventListener('load', () => {
	const element = document.getElementById('app');
	if (!element) throw new Error('No app found.');
	ReactDOM.render(<App />, element);
}, false);
