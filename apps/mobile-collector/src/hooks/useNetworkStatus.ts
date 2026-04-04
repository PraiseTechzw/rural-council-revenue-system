import { useEffect, useState } from "react";
import * as Network from "expo-network";

type NetworkStatus = {
	isConnected: boolean;
	isInternetReachable: boolean;
};

export function useNetworkStatus(): NetworkStatus {
	const [status, setStatus] = useState<NetworkStatus>({
		isConnected: true,
		isInternetReachable: true
	});

	useEffect(() => {
		let mounted = true;

		Network.getNetworkStateAsync().then((state) => {
			if (!mounted) {
				return;
			}

			setStatus({
				isConnected: Boolean(state.isConnected),
				isInternetReachable: state.isInternetReachable !== false
			});
		});

		const sub = Network.addNetworkStateListener((state) => {
			setStatus({
				isConnected: Boolean(state.isConnected),
				isInternetReachable: state.isInternetReachable !== false
			});
		});

		return () => {
			mounted = false;
			sub.remove();
		};
	}, []);

	return status;
}
