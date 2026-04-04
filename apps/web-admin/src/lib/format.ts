export function formatCurrency(value: number | string, currency = "USD"): string {
	const amount = typeof value === "string" ? Number(value) : value;
	return new Intl.NumberFormat("en-ZW", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(Number.isNaN(amount) ? 0 : amount);
}

export function formatDate(value: string | Date): string {
	return new Intl.DateTimeFormat("en-ZW", {
		dateStyle: "medium"
	}).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
	return new Intl.DateTimeFormat("en-ZW", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(new Date(value));
}
