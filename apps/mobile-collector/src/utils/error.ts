import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
	if (axios.isAxiosError(error)) {
		if (!error.response) {
			const target = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
			return target
				? `Cannot reach backend (${target}). Check API host and network.`
				: "Cannot reach backend. Check API host and network.";
		}

		const message =
			(error.response?.data as { message?: string } | undefined)?.message ||
			error.response?.statusText ||
			error.message;
		return message || fallback;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallback;
}
