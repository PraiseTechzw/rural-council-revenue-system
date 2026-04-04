export type Id = string;

export type ApiListMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type PaginationInput = {
	page?: number | string;
	limit?: number | string;
};

export type DateRangeInput = {
	startDate?: string;
	endDate?: string;
};

export type ActiveStatus = "active" | "inactive";

export type ApiSuccessResponse<T> = {
	success: true;
	message: string;
	data?: T;
	meta?: unknown;
};

export type ApiErrorResponse = {
	success: false;
	message: string;
	data?: unknown;
	meta?: unknown;
};

export type ApiResponseBody<T> = ApiSuccessResponse<T> | ApiErrorResponse;
