export function generateOfflineReferenceId(): string {
	const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `OFF-${Date.now()}-${rand}`;
}

export function generateLocalId(): string {
	const rand = Math.random().toString(36).slice(2, 10);
	return `local-${Date.now()}-${rand}`;
}

export function isToday(dateString: string): boolean {
	const date = new Date(dateString);
	const today = new Date();
	return (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	);
}
