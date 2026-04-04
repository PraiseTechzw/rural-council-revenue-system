import { DEFAULT_CURRENCY } from "../config/constants";

export function normalizeCurrency(currency?: string | null): string {
	return (currency ?? DEFAULT_CURRENCY).trim().toUpperCase();
}

export function toMinorUnits(amount: number | string): number {
	return Math.round(Number(amount) * 100);
}

export function fromMinorUnits(amountInCents: number): string {
	return (amountInCents / 100).toFixed(2);
}

export function formatCurrency(amount: number | string, currency?: string | null): string {
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: normalizeCurrency(currency),
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	return formatter.format(Number(amount));
}
