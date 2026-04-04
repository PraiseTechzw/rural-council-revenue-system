import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "../constants/config";

type SyncState = {
	isSyncing: boolean;
	lastSyncAt: string | null;
	pendingCount: number;
	lastError: string | null;
	failedItems: Array<{ localId: string; message: string }>;
	setSyncing: (value: boolean) => void;
	setPendingCount: (count: number) => void;
	setLastSyncAt: (value: string) => void;
	setLastError: (value: string | null) => void;
	setFailedItems: (items: Array<{ localId: string; message: string }>) => void;
};

export const useSyncStore = create<SyncState>()(
	persist(
		(set) => ({
			isSyncing: false,
			lastSyncAt: null,
			pendingCount: 0,
			lastError: null,
			failedItems: [],

			setSyncing(value) {
				set({ isSyncing: value });
			},

			setPendingCount(count) {
				set({ pendingCount: count });
			},

			setLastSyncAt(value) {
				set({ lastSyncAt: value });
			},

			setLastError(value) {
				set({ lastError: value });
			},

			setFailedItems(items) {
				set({ failedItems: items });
			}
		}),
		{
			name: storageKeys.syncStore,
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
);
