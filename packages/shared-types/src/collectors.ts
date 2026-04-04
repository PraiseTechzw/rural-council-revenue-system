import type { ID, Timestamped } from "./common";

export interface Collector extends Timestamped {
  id: ID;
  userId: ID;
  staffCode: string;
  wardId: ID;
  isActive: boolean;
}

export interface CreateCollectorDto {
  userId: ID;
  staffCode: string;
  wardId: ID;
}

export interface UpdateCollectorDto {
  wardId?: ID;
  isActive?: boolean;
}
