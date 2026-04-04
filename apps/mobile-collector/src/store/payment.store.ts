import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "../constants/config";
import type { CreatePaymentResponse, LocalPaymentRecord, PaymentPayload } from "../types/payment.types";
import { generateLocalId } from "../utils/helpers";

type PaymentState = {
	transactions: LocalPaymentRecord[];
	addPending: (payload: PaymentPayload) => LocalPaymentRecord;
	addSynced: (payload: PaymentPayload, response: CreatePaymentResponse) => LocalPaymentRecord;
	markSynced: (localId: string, response: CreatePaymentResponse) => void;
	markFailed: (localId: string, error: string) => void;
	upsertTransaction: (record: LocalPaymentRecord) => void;
};

function baseRecord(payload: PaymentPayload): LocalPaymentRecord {
	const now = new Date().toISOString();
	return {
		...payload,
		localId: generateLocalId(),
		createdAt: now,
		updatedAt: now,
		syncStatus: "pending"
	};
}

export const usePaymentStore = create<PaymentState>()(
	persist(
		(set, get) => ({
			transactions: [],

			addPending(payload) {
				const next = baseRecord(payload);
				set((state) => ({ transactions: [next, ...state.transactions] }));
				return next;
			},

			addSynced(payload, response) {
				const now = new Date().toISOString();
				const next: LocalPaymentRecord = {
					...baseRecord(payload),
					syncStatus: "synced",
					serverPaymentId: response.id,
					receiptNumber: response.receiptNumber,
					updatedAt: now
				};

				set((state) => ({ transactions: [next, ...state.transactions] }));
				return next;
			},

			markSynced(localId, response) {
				set((state) => ({
					transactions: state.transactions.map((item) =>
						item.localId === localId
							? {
									...item,
									syncStatus: "synced",
									syncError: undefined,
									serverPaymentId: response.id,
									receiptNumber: response.receiptNumber,
									updatedAt: new Date().toISOString()
								}
							: item
					)
				}));
			},

			markFailed(localId, error) {
				set((state) => ({
					transactions: state.transactions.map((item) =>
						item.localId === localId
							? {
									...item,
									syncStatus: "failed",
									syncError: error,
									updatedAt: new Date().toISOString()
								}
							: item
					)
				}));
			},

			upsertTransaction(record) {
				const exists = get().transactions.some((item) => item.localId === record.localId);
				if (!exists) {
					set((state) => ({ transactions: [record, ...state.transactions] }));
					return;
				}

				set((state) => ({
					transactions: state.transactions.map((item) => (item.localId === record.localId ? record : item))
				}));
			}
		}),
		{
			name: storageKeys.paymentStore,
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
);
