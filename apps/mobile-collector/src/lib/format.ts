export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZW", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount || 0);
}

export function formatDateTime(value: string): string {
	const date = new Date(value);
	return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatShortDate(value: string): string {
	return new Date(value).toLocaleDateString();
}
