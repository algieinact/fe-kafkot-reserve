import { Menu, Table } from "../types";

// Mock Menu Data
export const mockMenus: Menu[] = [
  // Coffee
  {
    id: 1,
    menu_name: "Espresso",
    category: "drink",
    description: "Classic Italian espresso dengan rasa bold dan rich",
    price: 25000,
    image_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    menu_name: "Cappuccino",
    category: "drink",
    description: "Espresso dengan steamed milk dan foam yang creamy",
    price: 30000,
    image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    menu_name: "Caffe Latte",
    category: "drink",
    description: "Espresso dengan lebih banyak steamed milk, perfect untuk pemula",
    price: 32000,
    image_url: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    menu_name: "Americano",
    category: "drink",
    description: "Espresso dengan hot water, strong dan smooth",
    price: 28000,
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    menu_name: "Mocha",
    category: "drink",
    description: "Kombinasi espresso, chocolate, dan steamed milk",
    price: 35000,
    image_url: "https://plus.unsplash.com/premium_photo-1671559021617-63260def0504?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },

  // Non-Coffee Drinks
  {
    id: 6,
    menu_name: "Matcha Latte",
    category: "drink",
    description: "Japanese matcha premium dengan susu hangat",
    price: 33000,
    image_url: "https://images.unsplash.com/photo-1717603545758-88cc454db69b?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    menu_name: "Chocolate",
    category: "drink",
    description: "Rich hot chocolate dengan whipped cream",
    price: 30000,
    image_url: "https://images.unsplash.com/photo-1542990253-a781e04c0082?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 8,
    menu_name: "Lemon Tea",
    category: "drink",
    description: "Teh segar dengan perasan lemon alami",
    price: 22000,
    image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },

  // Food
  {
    id: 9,
    menu_name: "Croissant",
    category: "food",
    description: "French butter croissant yang flaky dan buttery",
    price: 28000,
    image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 10,
    menu_name: "Sandwich Club",
    category: "food",
    description: "Triple decker sandwich dengan chicken, bacon, lettuce, dan tomato",
    price: 45000,
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 11,
    menu_name: "Pasta Carbonara",
    category: "food",
    description: "Creamy carbonara dengan bacon dan parmesan",
    price: 52000,
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 12,
    menu_name: "Nasi Goreng Special",
    category: "food",
    description: "Nasi goreng dengan telur, ayam, dan kerupuk",
    price: 38000,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },

  // Desserts
  {
    id: 13,
    menu_name: "Tiramisu",
    category: "dessert",
    description: "Italian dessert dengan coffee-soaked ladyfingers dan mascarpone",
    price: 42000,
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 14,
    menu_name: "Chocolate Brownie",
    category: "dessert",
    description: "Rich chocolate brownie dengan vanilla ice cream",
    price: 38000,
    image_url: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 15,
    menu_name: "Cheesecake",
    category: "dessert",
    description: "Creamy New York style cheesecake dengan berry compote",
    price: 40000,
    image_url: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop",
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Mock Table Data
export const mockTables: Table[] = [
  // Indoor Tables
  { 
    id: 1, 
    table_number: "1", 
    capacity: 2, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 2, 
    table_number: "2", 
    capacity: 2, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 3, 
    table_number: "3", 
    capacity: 4, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 4, 
    table_number: "4", 
    capacity: 4, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 5, 
    table_number: "5", 
    capacity: 6, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 6, 
    table_number: "6", 
    capacity: 8, 
    table_type: { id: 1, type_name: "indoor", description: "Indoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },

  // Semi-Outdoor Tables
  { 
    id: 7, 
    table_number: "7", 
    capacity: 2, 
    table_type: { id: 2, type_name: "semi_outdoor", description: "Semi-Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 8, 
    table_number: "8", 
    capacity: 4, 
    table_type: { id: 2, type_name: "semi_outdoor", description: "Semi-Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 9, 
    table_number: "9", 
    capacity: 4, 
    table_type: { id: 2, type_name: "semi_outdoor", description: "Semi-Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 10, 
    table_number: "10", 
    capacity: 6, 
    table_type: { id: 2, type_name: "semi_outdoor", description: "Semi-Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },

  // Outdoor Tables
  { 
    id: 11, 
    table_number: "11", 
    capacity: 2, 
    table_type: { id: 3, type_name: "outdoor", description: "Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 12, 
    table_number: "12", 
    capacity: 4, 
    table_type: { id: 3, type_name: "outdoor", description: "Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 13, 
    table_number: "13", 
    capacity: 4, 
    table_type: { id: 3, type_name: "outdoor", description: "Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
  { 
    id: 14, 
    table_number: "14", 
    capacity: 6, 
    table_type: { id: 3, type_name: "outdoor", description: "Outdoor Table", created_at: "2024-01-01", updated_at: "2024-01-01" }, 
    created_at: "2024-01-01", 
    updated_at: "2024-01-01",
    status: "available"
  },
];

