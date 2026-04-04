export function buildTemporaryReceiptNumber(offlineReferenceId: string): string {
	const suffix = offlineReferenceId.slice(-6).toUpperCase();
	return `TMP-${suffix}`;
}
