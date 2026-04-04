import type { LocalPaymentRecord } from "../../types/payment.types";

export function getPendingRecords(records: LocalPaymentRecord[]): LocalPaymentRecord[] {
  return records.filter((item) => item.syncStatus === "pending" || item.syncStatus === "failed");
}
