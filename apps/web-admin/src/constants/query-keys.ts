export const queryKeys = {
  currentUser: ["current-user"] as const,
  payments: (params: Record<string, unknown>) => ["payments", params] as const,
  payment: (id: string) => ["payment", id] as const,
  collectors: (params: Record<string, unknown>) => ["collectors", params] as const,
  revenueSources: (params: Record<string, unknown>) => ["revenue-sources", params] as const,
  wards: (params: Record<string, unknown>) => ["wards", params] as const,
  reportsDaily: (params: Record<string, unknown>) => ["reports", "daily", params] as const,
  reportsMonthly: (params: Record<string, unknown>) => ["reports", "monthly", params] as const,
  reportsBySource: (params: Record<string, unknown>) => ["reports", "by-source", params] as const,
  reportsByCollector: (params: Record<string, unknown>) => ["reports", "by-collector", params] as const,
  reportsByWard: (params: Record<string, unknown>) => ["reports", "by-ward", params] as const,
  receiptById: (id: string) => ["receipt", id] as const,
  receiptByNumber: (number: string) => ["receipt-number", number] as const
};