export type ID = string;

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
