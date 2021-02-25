// @flow

const React = require('react');
const {DateTime} = require('luxon');
const {useMemo} = require('react');
const classNames = require('classnames');

const Graph = (
	{
		width,
		duration,
		currentDayMillis,
		setCurrentDayMillis,
		allDaysMillis,
		volumes,
		flags,
		maxCallVolume,
		min,
		max,
	}: {
		width: number;
		duration: number; // in days
		currentDayMillis: number | null;
		setCurrentDayMillis: (newVal: number) => void;
		allDaysMillis: number[];
		volumes: number[];
		flags: boolean[];
		maxCallVolume: number;
		min: number;
		max: number;
	},
): React.Element<*> => {
	const divs = useMemo(() => {
		let result = [];
		if (duration > 0) {
			result = allDaysMillis.map((d, i) => {
				const callVolume = volumes[i];
				const flagged = flags[i];
				const selected = d === currentDayMillis;
				const scale = callVolume / maxCallVolume;

				return (
					<div
						key={i}
						onClick={() => setCurrentDayMillis(d)}
						className={classNames({bar: true, flagged, selected})}
						style={{
							left: (i * width / duration) + 'px',
							height: (50 * scale) + 'px',
						}}
					></div>
				);
			});
		}
		return result;
	}, [
		currentDayMillis,
		allDaysMillis,
		volumes,
		flags,
		maxCallVolume,
		duration,
	]);

	const maxXLabel = DateTime.fromMillis((max || 0) - 1)
		.toLocaleString(DateTime.DATE_MED);

	return (
		<React.Fragment>
			<div style={{display: 'flex'}}>
				<div className='graphContainer' style={{width: (width) + 'px'}}>
					{divs}
				</div>
				<div className='yAxis'>
					<div>
						{maxCallVolume}
					</div>
					<div>
						0
					</div>
				</div>
			</div>
			<div className='xAxis'>
				<div>
					{DateTime.fromMillis(min || 0).toLocaleString(DateTime.DATE_MED)}
				</div>
				<div>
					{maxXLabel}
				</div>
			</div>
		</React.Fragment>
	);
};

module.exports = {
	Graph,
};
