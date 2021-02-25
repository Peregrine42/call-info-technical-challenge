// @flow

require('core-js/stable');
require('regenerator-runtime/runtime');

const React = require('react');
const {useEffect, useState} = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios');
const {DateTime} = require('luxon');

const {Table} = require('./Table');
const {Graph} = require('./Graph');

function App() {
	const [calls, setCalls] = useState([]);
	const [filteredCalls, setFilteredCalls] = useState([]);
	const [currentDayMillis, setCurrentDayMillis] = useState(null);
	const [max, setMax] = useState(0);
	const [min, setMin] = useState(0);
	const [duration, setDuration] = useState(0);
	const [allDaysMillis, setAllDaysMillis] = useState([]);
	const [volumes, setVolumes] = useState([]);
	const [flags, setFlags] = useState([]);
	const [maxCallVolume, setMaxCallVolume] = useState(0);

	const width = 1000;

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

		getCalls().catch((e) => {
			throw (e);
		});
	}, []);

	useEffect(() => {
		const filtered = calls.filter((c) => {
			return DateTime
				.fromISO(c.started_at)
				.hasSame(DateTime.fromMillis(currentDayMillis || 0), 'day');
		});

		filtered.sort((c1, c2) => {
			const c1StartedAt = DateTime.fromISO(c1.started_at).toMillis();
			const c2StartedAt = DateTime.fromISO(c2.started_at).toMillis();
			if (c1StartedAt > c2StartedAt) {
				return 1;
			} else {
				return -1;
			}
		});

		setFilteredCalls(filtered);
	}, [calls, currentDayMillis]);

	if (calls.length) {
		const currentDayTitle = DateTime
			.fromMillis(currentDayMillis || 0)
			.toLocaleString(DateTime.DATE_MED);

		return (
			<div style={{width: width + 'px'}}>
				<div>
					<Graph
						max={max}
						min={min}
						duration={duration}
						currentDayMillis={currentDayMillis}
						setCurrentDayMillis={setCurrentDayMillis}
						allDaysMillis={allDaysMillis}
						volumes={volumes}
						flags={flags}
						maxCallVolume={maxCallVolume}
						width={width}
					/>
				</div>
				<div>
					<h1>{currentDayTitle} Call Details ({filteredCalls.length})</h1>
					<Table calls={filteredCalls} />
				</div>
			</div>
		);
	} else {
		return null;
	}
}


window.addEventListener('load', () => {
	const element = document.getElementById('app');
	if (!element) throw new Error('No app found.');
	ReactDOM.render(<App />, element);
}, false);
