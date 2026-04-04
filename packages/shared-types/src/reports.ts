import type { ID } from "./common";

export interface RevenueSummaryReport {
  totalAmount: number;
  transactionCount: number;
  from: string;
  to: string;
}

export interface CollectorPerformanceReport {
  collectorId: ID;
  collectorName: string;
  totalCollected: number;
  receiptCount: number;
}
