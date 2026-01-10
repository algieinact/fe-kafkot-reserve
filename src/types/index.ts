// Enums and Types
export type TableType = "indoor" | "semi_outdoor" | "outdoor";

// Visual Table Layout Types
export type TableShape = "square" | "rectangle";
export type AreaType = "indoor" | "semi_outdoor" | "outdoor";

export interface TablePosition {
  tableNumber: string;      // Display number like "A1", "B2", etc
  x: number;                // Position X in pixels (for layout config)
  y: number;                // Position Y in pixels (for layout config)
  width: number;            // Width in pixels (for layout config)
  height: number;           // Height in pixels (for layout config)
  shape: TableShape;        // Shape of table
  backendTableId?: number;  // Optional: mapping to backend table ID
}

export interface TableLayoutConfig {
  areaId: AreaType;
  areaName: string;
  width: number;            // Canvas width in pixels
  height: number;           // Canvas height in pixels
  tables: TablePosition[];
}

export interface TableWithStatus extends Table {
  position?: TablePosition;  // Optional position data for visual display
}

export type ReservationStatus = "pending_verification" | "confirmed" | "rejected" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "waiting_verification" | "verified" | "rejected";

export type MenuCategory = "food" | "drink" | "dessert";

// Menu Types
export interface Menu {
  id: number;
  menu_name: string;
  category: MenuCategory;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Table Types
export interface TableTypeDetail {
  id: number;
  type_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type TableStatus = "available" | "reserved" | "inactive";

export interface Table {
  id: number;
  table_number: string;
  table_type: TableTypeDetail;
  capacity: number;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

// Order Item Types
export interface OrderItem {
  id?: string;
  menu_id: number;
  menu?: Menu;
  quantity: number;
  price: number;
  subtotal: number;
}

// Payment Proof Types
export interface PaymentProof {
  id: string;
  file_url: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

// Reservation Types
export interface Reservation {
  id: number;
  booking_code: string;
  // Customer Info
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  // Reservation Details
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;
  special_notes?: string;

  // Table Assignment
  table_id?: number;
  table?: Table;

  // Order
  items?: OrderItem[];
  total_amount: number;

  // Payment
  payment_proof_url?: string;
  payment?: any;

  // Status
  status: ReservationStatus;

  // Timestamps
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

// User/Admin Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "super_admin" | "staff";
  created_at: string;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface ReservationFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;
  table_id: number;
  special_notes?: string;
  table_type?: string;
  order_items: {
    menu_id: number;
    quantity: number;
  }[];
}

export interface MenuFormData {
  menu_name: string;
  category: string;
  description: string;
  price: number;
  image?: File;
  is_available: boolean;
}

export interface TableFormData {
  table_number: string;
  table_type_id: number;
  capacity: number;
  status?: TableStatus;
}

// Cart Types
export interface CartItem {
  menu: Menu;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

// Table Availability Check Types
export interface TableAvailabilityRequest {
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  duration_hours: number;
  table_type_id: string;
}

export interface TableAvailabilityResponse {
  available: boolean;
  available_tables: Table[];
  suggested_table?: Table;
}

// Statistics Types (for Admin Dashboard)
export interface DashboardStats {
  summary: {
    total_reservations: number;
    pending_verifications: number;
    confirmed_reservations: number;
    total_revenue: number;
  };
  reservations_by_status: Array<{
    status: string;
    count: number;
  }>;
  recent_reservations: Reservation[];
  upcoming_reservations: Reservation[];
}

export interface ReservationChartData {
  date: string;
  count: number;
  revenue: number;
}
