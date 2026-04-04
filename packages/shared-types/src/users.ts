import type { ID, Timestamped } from "./common";

export interface User extends Timestamped {
  id: ID;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: string;
  isActive?: boolean;
}
