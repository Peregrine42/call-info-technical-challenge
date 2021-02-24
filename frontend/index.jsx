// @flow

require('core-js/stable');
require('regenerator-runtime/runtime');

const React = require('react');
const { useEffect, useState, useMemo } = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios');
const classNames = require('classnames');
const { DateTime, Duration } = require('luxon');

function App() {
	const [calls, setCalls] = useState([]);
	const [filteredCalls, setFilteredCalls] = useState([]);
	const [max, setMax] = useState(0);
	const [min, setMin] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentDayMillis, setCurrentDayMillis] = useState(null);
	const [allDaysMillis, setAllDaysMillis] = useState([]);
	const [volumes, setVolumes] = useState([]);
	const [flags, setFlags] = useState([]);
	const [maxCallVolume, setMaxCallVolume] = useState(0);

	const [width, setWidth] = useState(1000);

	useEffect(() => {
		async function getCalls() {
			const enrichedResponse = await axios.get('/calls');
			const enriched = enrichedResponse.data;
			setCalls(enriched.calls);
			setDuration(enriched.duration);
			setCurrentDayMillis(enriched.currentDayMillis);
			setAllDaysMillis(enriched.allDaysMillis);
			setVolumes(enriched.volumes);
			setFlags(enriched.flags);
			setMaxCallVolume(enriched.maxCallVolume);
			setMin(enriched.min);
			setMax(enriched.max);
		}

		getCalls().catch(e => { throw (e); });
	}, []);

	useEffect(() => {
		const filtered = calls.filter(c => {
			return DateTime.fromISO(c.started_at).hasSame(DateTime.fromMillis(currentDayMillis || 0), 'day');
		});

		filtered.sort((c1, c2) => {
			if (DateTime.fromISO(c1.started_at).toMillis() > DateTime.fromISO(c2.started_at).toMillis()) {
				return 1;
			} else {
				return -1;
			}
		});

		setFilteredCalls(filtered);
	}, [calls, currentDayMillis]);

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
			result = allDaysMillis.map((d, i) => {
				const callVolume = volumes[i];
				const flagged = flags[i];
				const selected = d === currentDayMillis
				const scale = callVolume / maxCallVolume;

				return (
					<div
						key={i}
						onClick={() => setCurrentDayMillis(d)}
						className={classNames({ bar: true, flagged, selected })}
						style={{
							left: (i * width / duration) + 'px',
							height: (50 * scale) + 'px'
						}}
					></div>
				);
			});
		}
		return result;
	}, [allDaysMillis, volumes, flags, maxCallVolume, duration, width, currentDayMillis]);

	if (calls.length) {
		return (
			<div style={{ width: '1000px' }}>
				<div style={{ display: 'flex' }}>
					<div style={{ display: 'flex', alignItems: 'end', width: (width) + 'px', height: '50px' }}>
						{divs}
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
						<div>
							{maxCallVolume}
						</div>
						<div>
							0
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div>
						{DateTime.fromMillis(min || 0).toLocaleString(DateTime.DATE_MED)}
					</div>
					<div>
						{DateTime.fromMillis((max || 0) - 1).toLocaleString(DateTime.DATE_MED)}
					</div>
				</div>
				<div>
					<h1>{DateTime.fromMillis(currentDayMillis || 0).toLocaleString(DateTime.DATE_MED)} Call Details ({filteredCalls.length})</h1>
					<table className='table' cellpadding="10">
						<thead>
							<tr>
								<th style={{width: '200px'}}>Start Time</th>
								<th style={{width: '200px'}}>Duration</th>
								<th style={{width: '100px'}}>Team</th>
								<th>Participants</th>
							</tr>
						</thead>
						<tbody>
							{callTableRows}
						</tbody>
					</table>
				</div>
			</div>
		);
	} else {
		return null
	}
}


(window: Window).addEventListener('load', () => {
	const element = document.getElementById('app');
	if (!element) throw new Error('No app found.');
	ReactDOM.render(<App />, element);
}, false);
