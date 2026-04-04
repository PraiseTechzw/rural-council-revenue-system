import type { ID } from "./common";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: ID;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDto {
  user: AuthUser;
  tokens: AuthTokens;
}
