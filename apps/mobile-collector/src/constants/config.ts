const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const appConfig = {
	apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : "https://rural-council-revenue-system.onrender.com/api/v1",
	requestTimeoutMs: 20000,
	syncBatchSize: 20
};

export const storageKeys = {
	authState: "@rural-collector/auth-state",
	paymentStore: "@rural-collector/payment-store",
	syncStore: "@rural-collector/sync-store",
	secureAccessToken: "rural-collector-access-token"
} as const;
