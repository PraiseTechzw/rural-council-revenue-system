export function toQueryNumber(value: string | null, fallback: number): number {
	const parsed = Number(value ?? fallback);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function buildPagination(totalPages?: number, current = 1): number[] {
	const pages = totalPages ?? 1;
	return Array.from({ length: pages }, (_, index) => index + 1).filter((page) => Math.abs(page - current) <= 2 || page === 1 || page === pages);
}
