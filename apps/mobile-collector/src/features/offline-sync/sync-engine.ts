import { syncApi } from "../../api/sync.api";
import { getErrorMessage } from "../../utils/error";
import { getPendingRecords } from "./queue-manager";
import type { CreatePaymentResponse, LocalPaymentRecord } from "../../types/payment.types";

type SyncEngineArgs = {
  records: LocalPaymentRecord[];
  onSynced: (localId: string, response: CreatePaymentResponse) => void;
  onFailed: (localId: string, error: string) => void;
};

export async function runSyncEngine({ records, onSynced, onFailed }: SyncEngineArgs) {
  const pending = getPendingRecords(records);
  const failedItems: Array<{ localId: string; message: string }> = [];

  for (const payment of pending) {
    try {
      const response = await syncApi.syncOne(payment);
      onSynced(payment.localId, response);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to sync payment.");
      onFailed(payment.localId, message);
      failedItems.push({ localId: payment.localId, message });
    }
  }

  return {
    pendingCount: failedItems.length,
    failedItems
  };
}
