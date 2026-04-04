import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import { runSyncEngine } from "../features/offline-sync/sync-engine";
import { useNetworkStatus } from "./useNetworkStatus";
import { useOfflineQueue } from "./useOfflineQueue";
import { useSyncStore } from "../store/sync.store";

export function useSync() {
	const { isConnected, isInternetReachable } = useNetworkStatus();
	const isOnline = isConnected && isInternetReachable;
	const { pendingPayments, markSynced, markFailed } = useOfflineQueue();

	const isSyncing = useSyncStore((state) => state.isSyncing);
	const setSyncing = useSyncStore((state) => state.setSyncing);
	const setPendingCount = useSyncStore((state) => state.setPendingCount);
	const setLastSyncAt = useSyncStore((state) => state.setLastSyncAt);
	const setLastError = useSyncStore((state) => state.setLastError);
	const setFailedItems = useSyncStore((state) => state.setFailedItems);

	useEffect(() => {
		setPendingCount(pendingPayments.length);
	}, [pendingPayments.length, setPendingCount]);

	const mutation = useMutation({
		mutationFn: async () => {
			if (!isOnline) {
				throw new Error("No internet connection. Connect and retry.");
			}

			return runSyncEngine({
				records: pendingPayments,
				onSynced: markSynced,
				onFailed: markFailed
			});
		},
		onMutate: () => {
			setSyncing(true);
			setLastError(null);
		},
		onSuccess: (result) => {
			setPendingCount(result.pendingCount);
			setLastSyncAt(new Date().toISOString());
			setFailedItems(result.failedItems);
			if (result.failedItems.length > 0) {
				setLastError("Some records failed to sync. Retry to continue.");
			}
		},
		onError: (error) => {
			setLastError(error instanceof Error ? error.message : "Sync failed.");
		},
		onSettled: () => {
			setSyncing(false);
		}
	});

	const syncNow = useCallback(async () => {
		if (isSyncing || mutation.isPending || pendingPayments.length === 0 || !isOnline) {
			return;
		}

		await mutation.mutateAsync();
	}, [isOnline, isSyncing, mutation, pendingPayments.length]);

	useEffect(() => {
		if (isOnline && pendingPayments.length > 0 && !isSyncing && !mutation.isPending) {
			mutation.mutate();
		}
	}, [isOnline, isSyncing, mutation, pendingPayments.length]);

	return {
		syncNow,
		isOnline,
		isSyncing: isSyncing || mutation.isPending,
		pendingCount: pendingPayments.length,
		error: mutation.error instanceof Error ? mutation.error.message : null
	};
}
