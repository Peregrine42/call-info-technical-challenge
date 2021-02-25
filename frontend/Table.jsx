// @flow

const React = require('react');
const {useMemo} = require('react');
const {DateTime, Duration} = require('luxon');
const classNames = require('classnames');

const Table = ({calls} : {calls: EnrichedCall[]}): React.Element<*> => {
	const callTableRows = useMemo(() => calls.map((call) => {
		const callStartedAt = DateTime
			.fromISO(call.started_at)
			.toLocaleString(DateTime.DATETIME_MED);

		const callDuration = Duration
			.fromMillis(call.duration)
			.toISOTime({suppressMilliseconds: true});

		const rowColor = call.flagged ? 'f1b077' : '';

		return (
			<tr key={call.call_id} style={{backgroundColor: rowColor}}>
				<td>{callStartedAt}</td>
				<td>{callDuration}</td>
				<td>{call.team && call.team.name}</td>
				<td>{call.participants.join(', ')}</td>
			</tr>
		);
	}), [calls]);

	return (
		<table className='table' cellPadding="10">
			<thead>
				<tr>
					<th style={{width: '200px'}}>Start Time</th>
					<th style={{width: '100px'}}>Duration</th>
					<th style={{width: '100px'}}>Team</th>
					<th>Participants</th>
				</tr>
			</thead>
			<tbody>
				{callTableRows}
			</tbody>
		</table>
	);
};

module.exports = {
	Table,
};
