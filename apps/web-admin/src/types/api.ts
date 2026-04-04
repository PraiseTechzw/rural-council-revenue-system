export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiMeta;
};

export type Role = "admin" | "finance_officer" | "collector";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResult = {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
};

export type PaymentRecord = {
  id: string;
  receipt: {
    id: string | null;
    receiptNumber: string;
    issuedAt: string | null;
  };
  payer: { id: string; name: string };
  collector: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  revenueSource: { id: string; name: string };
  ward: { id: string; name: string; code: string } | null;
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  notes: string | null;
  offlineReferenceId: string | null;
  syncStatus: string;
  status: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type Collector = {
  id: string;
  userId: string;
  wardId: string | null;
  employeeNumber: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  wardName?: string | null;
  wardCode?: string | null;
};

export type UserRecord = {
  id: string;
  roleId: string;
  roleName: Role;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RevenueSource = {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Ward = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Receipt = {
  id: string;
  receiptNumber: string;
  paymentId: string;
  payerName: string;
  collectorName: string;
  revenueSourceName: string;
  wardName: string | null;
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  notes: string | null;
  issuedAt: string;
};