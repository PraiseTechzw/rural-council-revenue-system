import { apiClient } from "./client";
import type { ApiResponse, Receipt } from "@/types/api";

export async function getReceiptById(id: string): Promise<Receipt> {
  const { data } = await apiClient.get<ApiResponse<Receipt>>(`/receipts/${id}`);

  if (!data.success || !data.data) {
    throw new Error(data.message || "Receipt not found");
  }

  return data.data;
}

export async function getReceiptByNumber(receiptNumber: string): Promise<Receipt> {
  const { data } = await apiClient.get<ApiResponse<Receipt>>(`/receipts/number/${receiptNumber}`);

  if (!data.success || !data.data) {
    throw new Error(data.message || "Receipt not found");
  }

  return data.data;
}