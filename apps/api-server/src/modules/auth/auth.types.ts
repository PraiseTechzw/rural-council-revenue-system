export type AuthUser = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	phoneNumber?: string | null;
};

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
	expiresIn: string;
	refreshExpiresIn: string;
};

export type LoginResult = {
	user: AuthUser;
	tokens: AuthTokens;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type ChangePasswordInput = {
	currentPassword: string;
	newPassword: string;
};
