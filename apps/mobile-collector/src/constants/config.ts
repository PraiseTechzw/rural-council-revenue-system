const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const appConfig = {
	apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : "http://10.0.2.2:4000/api/v1",
	requestTimeoutMs: 20000,
	syncBatchSize: 20
};

export const storageKeys = {
	authState: "@rural-collector/auth-state",
	paymentStore: "@rural-collector/payment-store",
	syncStore: "@rural-collector/sync-store",
	secureAccessToken: "rural-collector-access-token"
} as const;
