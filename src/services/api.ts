import {
  Menu,
  MenuFormData,
  Table,
  TableFormData,
  Reservation,
  ReservationFormData,
  User,
  LoginCredentials,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  TableAvailabilityRequest,
  TableAvailabilityResponse,
  DashboardStats,
  ReservationStatus,
} from "../types";

// Base API URL - Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper function to create headers
const createHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    return {
      success: false,
      error: error.message || `HTTP error! status: ${response.status}`,
    };
  }

  const jsonResponse = await response.json();
  
  // If the backend already returns {success: true, data: ...}, unwrap it
  if (jsonResponse.success !== undefined && jsonResponse.data !== undefined) {
    return {
      success: jsonResponse.success,
      data: jsonResponse.data,
      message: jsonResponse.message,
      error: jsonResponse.error,
    };
  }
  
  // Otherwise, wrap the response
  return {
    success: true,
    data: jsonResponse,
  };
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: createHeaders(true),
    });
    return handleResponse<User>(response);
  },
};

// ============================================
// MENU API
// ============================================

export const menuApi = {
  getMenus: async (params?: {
    category?: string;
    search?: string;
    available_only?: boolean;
  }): Promise<ApiResponse<Menu[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.available_only) queryParams.append("available_only", "true");

    const response = await fetch(`${API_BASE_URL}/menus?${queryParams}`, {
      headers: createHeaders(),
    });
    return handleResponse<Menu[]>(response);
  },

  getMenuById: async (id: string): Promise<ApiResponse<Menu>> => {
    const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse<Menu>(response);
  },

  createMenu: async (data: MenuFormData): Promise<ApiResponse<Menu>> => {
    const formData = new FormData();
    formData.append("menu_name", data.menu_name);
    formData.append("category", data.category);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("is_available", data.is_available.toString());
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(`${API_BASE_URL}/admin/menus`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse<Menu>(response);
  },

  updateMenu: async (id: string, data: MenuFormData): Promise<ApiResponse<Menu>> => {
    const formData = new FormData();
    formData.append("menu_name", data.menu_name);
    formData.append("category", data.category);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("is_available", data.is_available.toString());
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(`${API_BASE_URL}/admin/menus/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse<Menu>(response);
  },

  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/menus/${id}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },
};

// ============================================
// TABLE API
// ============================================

export const tableApi = {
  getTables: async (params?: {
    type?: string;
    available_only?: boolean;
  }): Promise<ApiResponse<Table[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.available_only) queryParams.append("available_only", "true");

    const response = await fetch(`${API_BASE_URL}/tables?${queryParams}`, {
      headers: createHeaders(),
    });
    return handleResponse<Table[]>(response);
  },

  getTableById: async (id: string): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse<Table>(response);
  },

  createTable: async (data: TableFormData): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE_URL}/admin/tables`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<Table>(response);
  },

  updateTable: async (id: string, data: TableFormData): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<Table>(response);
  },

  deleteTable: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    return handleResponse<void>(response);
  },

  checkAvailability: async (
    data: TableAvailabilityRequest
  ): Promise<ApiResponse<TableAvailabilityResponse>> => {
    const response = await fetch(`${API_BASE_URL}/tables/check-availability`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<TableAvailabilityResponse>(response);
  },
};

// ============================================
// RESERVATION API
// ============================================

export const reservationApi = {
  getReservations: async (params?: {
    status?: ReservationStatus;
    date?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.date) queryParams.append("date", params.date);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());

    const response = await fetch(`${API_BASE_URL}/admin/reservations?${queryParams}`, {
      headers: createHeaders(true),
    });
    return handleResponse<PaginatedResponse<Reservation>>(response);
  },

  getReservationById: async (id: string): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse<Reservation>(response);
  },

  createReservation: async (data: ReservationFormData): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Reservation>(response);
  },

  uploadPaymentProof: async (
    reservationId: string,
    file: File
  ): Promise<ApiResponse<Reservation>> => {
    const formData = new FormData();
    formData.append("payment_proof", file);

    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/upload-payment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse<Reservation>(response);
  },

  verifyPayment: async (
    reservationId: string,
    data: {
      rejection_reason?: string;
    }
  ): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}/verify`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<Reservation>(response);
  },

  rejectPayment: async (
    reservationId: string,
    data: {
      rejection_reason: string;
    }
  ): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}/reject`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse<Reservation>(response);
  },

  completeReservation: async (reservationId: string): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}/complete`, {
      method: "PATCH",
      headers: createHeaders(true),
    });
    return handleResponse<Reservation>(response);
  },

  cancelReservation: async (reservationId: string): Promise<ApiResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    return handleResponse<Reservation>(response);
  },
};

// ============================================
// DASHBOARD/STATS API
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: createHeaders(true),
    });
    return handleResponse<DashboardStats>(response);
  },

  getReservationChart: async (days = 7): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/reservation-chart?days=${days}`, {
      headers: createHeaders(true),
    });
    return handleResponse<any>(response);
  },
};

// Export all APIs
export default {
  auth: authApi,
  menu: menuApi,
  table: tableApi,
  reservation: reservationApi,
  dashboard: dashboardApi,
};
