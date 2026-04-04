import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setJsonItem<T>(key: string, value: T): Promise<void> {
	await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJsonItem<T>(key: string): Promise<T | null> {
	const raw = await AsyncStorage.getItem(key);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function removeItem(key: string): Promise<void> {
	await AsyncStorage.removeItem(key);
}
