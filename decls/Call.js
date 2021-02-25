interface UserRef {
	user_id: number
}

class Call {
	call_id: string;
	team_id: number;
	participants: UserRef[];
	started_at: string;
	duration: number;
}