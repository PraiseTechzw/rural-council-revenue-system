import * as Network from "expo-network";
import { useEffect, useState } from "react";

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
		let active = true;

		const refresh = async () => {
			const state = await Network.getNetworkStateAsync();
			if (!active) {
				return;
			}

			setStatus({
				isConnected: state.isConnected !== false,
				isInternetReachable: state.isInternetReachable !== false
			});
		};

		void refresh();
		const intervalId = setInterval(() => {
			void refresh();
		}, 5000);

		return () => {
			active = false;
			clearInterval(intervalId);
		};
	}, []);

	return status;
}
