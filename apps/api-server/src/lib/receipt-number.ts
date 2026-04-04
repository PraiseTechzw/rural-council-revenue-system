import crypto from "node:crypto";

export function generateReceiptNumber(prefix = "RCPT"): string {
	const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
	return `${prefix}-${datePart}-${randomPart}`;
}
