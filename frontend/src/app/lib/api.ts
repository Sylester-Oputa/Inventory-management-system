type ApiErrorPayload = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: "OWNER" | "STAFF";
  isActive: boolean;
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "elimed_token";
const USER_KEY = "elimed_user";
const BACKUP_DIR_KEY = "elimed_backup_dir";

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getAuthUser(): AuthUser | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setBackupDir(path: string) {
  localStorage.setItem(BACKUP_DIR_KEY, path);
}

export function getBackupDir() {
  return localStorage.getItem(BACKUP_DIR_KEY);
}

export function getSetupStatus() {
  return request<{ isSetupComplete: boolean }>("/status/setup", {
    method: "GET",
  });
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const data = (payload || {}) as ApiErrorPayload;
    const message =
      data.error?.message ||
      data.error?.code ||
      `Request failed (${response.status})`;
    const error = new Error(message) as Error & {
      code?: string;
      details?: unknown;
    };
    error.code = data.error?.code;
    error.details = data.error?.details;
    throw error;
  }

  return payload as T;
}

export function setupOwner(payload: {
  name: string;
  username: string;
  password: string;
}) {
  return request<{ id: string; name: string; username: string; role: string }>(
    "/setup/owner",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function login(payload: { username: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetOwnerPassword(payload: {
  username: string;
  recoveryCode: string;
  newPassword: string;
}) {
  return request<{ updated: boolean }>("/auth/reset-owner-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function runBackup() {
  return request<{ path: string }>("/backup/run", {
    method: "POST",
    auth: true,
  });
}

export function exportBackup(payload: {
  targetPath: string;
  sourcePath?: string;
}) {
  return request<{ path: string }>("/backup/export", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function restoreBackup(payload: {
  backupPath: string;
  confirmation: true;
}) {
  return request<{ restored: boolean; path: string }>("/backup/restore", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// Excel Export APIs
export function generateExcelExport(targetPath?: string) {
  return request<{ success: boolean; message: string; filepath: string }>(
    "/export/generate",
    {
      method: "POST",
      body: JSON.stringify({ targetPath }),
      auth: true,
    },
  );
}

export function listExports() {
  return request<Array<{ filename: string; size: number; created: string }>>(
    "/export/list",
    {
      method: "GET",
      auth: true,
    },
  );
}

export function downloadExport(filename: string) {
  const token = getAuthToken();
  // Direct download via anchor tag
  const url = `${API_BASE_URL}/export/download/${encodeURIComponent(filename)}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  if (token) {
    // For authenticated download, open in new window
    window.open(`${url}?token=${token}`, "_blank");
  } else {
    a.click();
  }
}

export function deleteExport(filename: string) {
  return request<{ success: boolean; message: string }>(
    `/export/delete/${encodeURIComponent(filename)}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
}

export function getDashboardSummary() {
  return request<{
    todaysSales: {
      total: number;
      transactionCount: number;
      profit: number;
    };
    recentTransactions: Array<{
      id: string;
      receiptNo: string;
      time: string;
      soldBy: string;
      total: number;
    }>;
    alerts: {
      lowStockCount: number;
      expiringCount: number;
      expiredCount: number;
    };
  }>("/dashboard/summary", {
    method: "GET",
    auth: true,
  });
}

export function getLowStock() {
  return request<
    Array<{
      id: string;
      name: string;
      sellingPrice: number;
      reorderLevel: number | null;
      isActive: boolean;
      totalQty: number;
    }>
  >("/reports/low-stock", {
    method: "GET",
    auth: true,
  });
}

// Products API
export function getProducts() {
  return request<
    Array<{
      id: string;
      name: string;
      sellingPrice: number;
      reorderLevel: number | null;
      isActive: boolean;
      totalQty: number;
    }>
  >("/products", {
    method: "GET",
    auth: true,
  });
}

export function createProduct(payload: {
  name: string;
  sellingPrice: number;
  reorderLevel: number;
}) {
  return request<{
    id: string;
    name: string;
    sellingPrice: number;
    reorderLevel: number;
    isActive: boolean;
  }>("/products", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  id: string,
  payload: {
    name?: string;
    sellingPrice?: number;
    reorderLevel?: number;
    isActive?: boolean;
  },
) {
  return request<{
    id: string;
    name: string;
    sellingPrice: number;
    reorderLevel: number;
    isActive: boolean;
  }>(`/products/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// Sales API
export function createSale(payload: {
  items: Array<{ productId: string; qty: number }>;
  paymentMethod?: string;
  note?: string;
}) {
  return request<{
    id: string;
    receiptNo: string;
    grossTotal: number;
    discountPercent: number;
    discountFixed: number;
    netTotal: number;
    paymentMethod: string;
  }>("/sales", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function getSales(params?: {
  startDate?: string;
  endDate?: string;
  staffId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.staffId) searchParams.set("staffId", params.staffId);

  const query = searchParams.toString();
  return request<
    Array<{
      id: string;
      receiptNo: string;
      netTotal: number;
      totalCost: number;
      profit: number;
      paymentMethod: string;
      createdAt: string;
      soldBy: {
        id: string;
        name: string;
        username: string;
      };
      items: Array<{
        id: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>;
    }>
  >(`/sales${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function reprintReceipt(saleId: string) {
  return request<{ receiptNo: string }>(`/sales/${saleId}/reprint`, {
    method: "POST",
    auth: true,
  });
}

// Inventory API
export function getInventory() {
  return request<
    Array<{
      id: string;
      name: string;
      totalQty: number;
      reorderLevel: number | null;
      lots: Array<{
        id: string;
        lotRefNo: string;
        expiryDate: string;
        qtyRemaining: number;
      }>;
    }>
  >("/inventory", {
    method: "GET",
    auth: true,
  });
}

// Stock In API
export function createStockIn(payload: {
  supplierId?: string;
  supplierName: string;
  items: Array<{
    productId: string;
    qtyAdded: number;
    unitCost: number;
    expiryDate: string;
  }>;
}) {
  return request<{
    id: string;
    refNo: string;
    supplierName: string;
    totalCost: number;
  }>("/stock-in", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function getStockInHistory() {
  return request<
    Array<{
      id: string;
      refNo: string;
      supplierName: string;
      totalCost: number;
      createdAt: string;
      receivedBy: {
        id: string;
        name: string;
      };
    }>
  >("/stock-in", {
    method: "GET",
    auth: true,
  });
}

// User Management APIs
export function getUsers() {
  return request<
    Array<{
      id: string;
      name: string;
      username: string;
      role: string;
      isActive: boolean;
      createdAt: string;
    }>
  >("/users", {
    method: "GET",
    auth: true,
  });
}

export function createUser(payload: {
  name: string;
  username: string;
  password: string;
  role: "STAFF";
}) {
  return request<{
    id: string;
    name: string;
    username: string;
    role: string;
    isActive: boolean;
  }>("/users", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function toggleUserStatus(userId: string) {
  return request<{ isActive: boolean }>(`/users/${userId}`, {
    method: "PATCH",
    auth: true,
  });
}

export function resetUserPassword(
  userId: string,
  payload: { newPassword: string },
) {
  return request<{ success: boolean }>(`/users/${userId}/reset-password`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// Expiry Reports APIs
export function getExpiringLots(params?: { daysAhead?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.daysAhead) searchParams.set("days", params.daysAhead.toString());

  const query = searchParams.toString();
  return request<
    Array<{
      id: string;
      lotRefNo: string;
      expiryDate: string;
      qtyRemaining: number;
      product: {
        id: string;
        name: string;
      };
      daysUntilExpiry: number;
    }>
  >(`/reports/expiring${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function getExpiredLots() {
  return request<
    Array<{
      id: string;
      lotRefNo: string;
      expiryDate: string;
      qtyRemaining: number;
      product: {
        id: string;
        name: string;
      };
      daysExpired: number;
    }>
  >("/reports/expired", {
    method: "GET",
    auth: true,
  });
}

// Settings/Store Info API
export function getStoreInfo() {
  return request<{
    id: string;
    name: string;
    address: string;
    phone: string;
    backupFolder: string;
  }>("/setup/store", {
    method: "GET",
    auth: true,
  });
}

export function updateStoreInfo(payload: {
  name: string;
  address: string;
  phone: string;
  backupFolder?: string;
}) {
  return request<{
    id: string;
    name: string;
    address: string;
    phone: string;
    backupFolder: string;
  }>("/setup/store", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}
