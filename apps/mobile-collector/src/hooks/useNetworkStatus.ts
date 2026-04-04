import * as Network from "expo-network";

type NetworkStatus = {
	isConnected: boolean;
	isInternetReachable: boolean;
};

export function useNetworkStatus(): NetworkStatus {
	const state = Network.useNetworkState();

	return {
		isConnected: state.isConnected !== false,
		isInternetReachable: state.isInternetReachable !== false
	};
}
