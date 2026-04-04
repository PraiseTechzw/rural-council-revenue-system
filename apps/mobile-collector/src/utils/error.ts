import axios from "axios";

function extractValidationMessage(responseData: unknown): string | null {
	if (!responseData || typeof responseData !== "object") {
		return null;
	}

	const meta = (responseData as { meta?: { details?: unknown; issues?: unknown } }).meta;
	const details = meta?.details ?? meta?.issues;

	if (!details || typeof details !== "object") {
		return null;
	}

	const fieldErrors = (details as { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] }).fieldErrors;
	const formErrors = (details as { formErrors?: string[] }).formErrors;

	if (fieldErrors) {
		for (const messages of Object.values(fieldErrors)) {
			if (messages && messages.length > 0) {
				return messages[0];
			}
		}
	}

	if (formErrors && formErrors.length > 0) {
		return formErrors[0];
	}

	return null;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
	if (axios.isAxiosError(error)) {
		if (!error.response) {
			const target = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
			return target
				? `Cannot reach backend (${target}). Check API host and network.`
				: "Cannot reach backend. Check API host and network.";
		}

		const validationMessage = extractValidationMessage(error.response.data);
		if (validationMessage) {
			return validationMessage;
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
