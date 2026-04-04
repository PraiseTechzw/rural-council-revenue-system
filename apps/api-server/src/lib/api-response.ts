import type { ApiListMeta, ApiResponseBody } from "../types/common.types";

export function success<T>(message: string, data?: T, meta?: unknown): ApiResponseBody<T> {
	return {
		success: true,
		message,
		...(data === undefined ? {} : { data }),
		...(meta === undefined ? {} : { meta })
	};
}

export function error(message: string, meta?: unknown): ApiResponseBody<never> {
	return {
		success: false,
		message,
		...(meta === undefined ? {} : { meta })
	};
}

export function paginated<T>(message: string, data: T[], meta: ApiListMeta): ApiResponseBody<T[]> {
	return {
		success: true,
		message,
		data,
		meta
	};
}
