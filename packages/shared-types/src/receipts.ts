import type { ID, Timestamped } from "./common";

export interface Receipt extends Timestamped {
  id: ID;
  paymentId: ID;
  receiptNumber: string;
  issuedAt: string;
}

export interface ReceiptView {
  receiptNumber: string;
  payerName: string;
  amount: number;
  issuedAt: string;
}
