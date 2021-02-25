interface EnrichedCall {
	call_id: string;
	team_id: number;
	team?: Team;
	participants: string[] | UserRef[];
	started_at: string;
	duration: number;
	flagged?: boolean;
}