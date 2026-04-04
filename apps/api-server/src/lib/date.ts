import { DEFAULT_TIMEZONE } from "../config/constants";

function toDateStringInTimezone(date: Date, timeZone: string): string {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});

	return formatter.format(date);
}

function buildDateInTimezone(dateString: string, suffix: string): Date {
	return new Date(`${dateString}T${suffix}${DEFAULT_TIMEZONE === "Africa/Harare" ? "+02:00" : "Z"}`);
}

export function nowUtc(): Date {
	return new Date();
}

export function startOfDay(date: Date | string): Date {
	const dateString = typeof date === "string" ? date : toDateStringInTimezone(date, DEFAULT_TIMEZONE);
	return buildDateInTimezone(dateString, "00:00:00.000");
}

export function endOfDay(date: Date | string): Date {
	const dateString = typeof date === "string" ? date : toDateStringInTimezone(date, DEFAULT_TIMEZONE);
	return buildDateInTimezone(dateString, "23:59:59.999");
}

export function toIsoDate(date: Date | string): string {
	const value = typeof date === "string" ? new Date(date) : date;
	return toDateStringInTimezone(value, DEFAULT_TIMEZONE);
}

export function formatDateTime(date: Date | string, locale = "en-ZW"): string {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: DEFAULT_TIMEZONE
	}).format(new Date(date));
}

export function isDateValue(value: unknown): value is Date {
	return value instanceof Date && !Number.isNaN(value.getTime());
}
