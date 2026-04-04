import type { ID, Timestamped } from "./common";

export interface Payer extends Timestamped {
  id: ID;
  fullName: string;
  phone?: string;
  wardId: ID;
}

export interface CreatePayerDto {
  fullName: string;
  phone?: string;
  wardId: ID;
}

export interface UpdatePayerDto {
  fullName?: string;
  phone?: string;
  wardId?: ID;
}
