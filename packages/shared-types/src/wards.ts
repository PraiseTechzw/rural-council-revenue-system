import type { ID, Timestamped } from "./common";

export interface Ward extends Timestamped {
  id: ID;
  name: string;
  code: string;
}

export interface CreateWardDto {
  name: string;
  code: string;
}

export interface UpdateWardDto {
  name?: string;
  code?: string;
}
