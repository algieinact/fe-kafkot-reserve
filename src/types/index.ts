// Enums
export enum TableType {
  INDOOR = "indoor",
  SEMI_OUTDOOR = "semi_outdoor",
  OUTDOOR = "outdoor",
}

export enum ReservationStatus {
  PENDING_PAYMENT = "pending_payment",
  PENDING_VERIFICATION = "pending_verification",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum PaymentStatus {
  PENDING = "pending",
  WAITING_VERIFICATION = "waiting_verification",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum MenuCategory {
  FOOD = "food",
  DRINK = "drink",
  DESSERT = "dessert",
}

// Menu Types
export interface Menu {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Table Types
export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  type: TableType;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Order Item Types
export interface OrderItem {
  id?: string;
  menu_id: string;
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
  id: string;
  // Customer Info
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Reservation Details
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  table_type: TableType;
  special_notes?: string;
  
  // Table Assignment
  table_id?: string;
  table?: Table;
  
  // Order
  order_items: OrderItem[];
  total_amount: number;
  
  // Payment
  payment_proof?: PaymentProof;
  payment_status: PaymentStatus;
  
  // Status
  status: ReservationStatus;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

// User/Admin Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
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
  table_type: TableType;
  special_notes?: string;
  order_items: OrderItem[];
}

export interface MenuFormData {
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  image?: File;
  is_available: boolean;
}

export interface TableFormData {
  table_number: string;
  capacity: number;
  type: TableType;
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
  table_type: TableType;
}

export interface TableAvailabilityResponse {
  available: boolean;
  available_tables: Table[];
  suggested_table?: Table;
}

// Statistics Types (for Admin Dashboard)
export interface DashboardStats {
  today_reservations: number;
  pending_verifications: number;
  today_revenue: number;
  monthly_revenue: number;
  total_customers: number;
}

export interface ReservationChartData {
  date: string;
  count: number;
  revenue: number;
}
