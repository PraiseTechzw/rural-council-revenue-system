import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../config/constants";
import type { ApiListMeta } from "../types/common.types";

export function parsePagination(input: { page?: string | number; limit?: string | number }) {
	const page = Math.max(Number(input.page ?? DEFAULT_PAGE), 1);
	const limit = Math.min(Math.max(Number(input.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);

	return {
		page,
		limit,
		offset: (page - 1) * limit
	};
}

export function buildPaginationMeta(page: number, limit: number, total: number): ApiListMeta {
	return {
		page,
		limit,
		total,
		totalPages: Math.max(Math.ceil(total / limit), 1)
	};
}
