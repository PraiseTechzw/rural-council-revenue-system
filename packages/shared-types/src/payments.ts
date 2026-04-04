import type { ID, Timestamped } from "./common";

export type PaymentMethod = "cash" | "transfer" | "pos";

export interface Payment extends Timestamped {
  id: ID;
  payerId: ID;
  collectorId: ID;
  amount: number;
  paymentMethod: PaymentMethod;
  revenueSourceId: ID;
  paidAt: string;
}

export interface CreatePaymentDto {
  payerId: ID;
  collectorId: ID;
  amount: number;
  paymentMethod: PaymentMethod;
  revenueSourceId: ID;
}
