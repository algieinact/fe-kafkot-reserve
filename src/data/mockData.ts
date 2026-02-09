import { Menu, Table } from "../types";

// Mock Menu Data
export const mockMenus: Menu[] = [
  // Coffee
  {
    id: 1,
    menu_name: "Espresso",
    category_id: 1,
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
    category_id: 1,
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
    category_id: 1,
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
    category_id: 1,
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
    category_id: 1,
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
    category_id: 2,
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
    category_id: 2,
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
    category_id: 2,
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
    category_id: 4,
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
    category_id: 4,
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
    category_id: 5,
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
    category_id: 6,
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
    category_id: 9,
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
    category_id: 9,
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
    category_id: 9,
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
    table_number: "A1",
    capacity: 4,
    table_type: {
      id: 1,
      type_name: "Indoor Standard",
      description: "Meja standar untuk 4 orang di dalam ruangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 0,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 2,
    table_number: "A2",
    capacity: 4,
    table_type: {
      id: 1,
      type_name: "Indoor Standard",
      description: "Meja standar untuk 4 orang di dalam ruangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 50,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 3,
    table_number: "A3",
    capacity: 2,
    table_type: {
      id: 2,
      type_name: "Indoor Small",
      description: "Meja kecil untuk 2 orang",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 100,
    position_y: 0,
    orientation: "vertical"
  },
  {
    id: 4,
    table_number: "B1",
    capacity: 6,
    table_type: {
      id: 3,
      type_name: "Indoor Large",
      description: "Meja besar untuk 6 orang",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 0,
    position_y: 50,
    orientation: "horizontal"
  },
  {
    id: 5,
    table_number: "B2",
    capacity: 4,
    table_type: {
      id: 1,
      type_name: "Indoor Standard",
      description: "Meja standar untuk 4 orang di dalam ruangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 50,
    position_y: 50,
    orientation: "horizontal"
  },
  {
    id: 6,
    table_number: "C1",
    capacity: 8,
    table_type: {
      id: 4,
      type_name: "VIP",
      description: "Meja VIP untuk 8 orang",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 2,
    position_x: 0,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 7,
    table_number: "O1",
    capacity: 4,
    table_type: {
      id: 5,
      type_name: "Outdoor Standard",
      description: "Meja outdoor dengan pemandangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 3,
    position_x: 0,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 8,
    table_number: "O2",
    capacity: 4,
    table_type: {
      id: 5,
      type_name: "Outdoor Standard",
      description: "Meja outdoor dengan pemandangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 3,
    position_x: 50,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 9,
    table_number: "O3",
    capacity: 2,
    table_type: {
      id: 6,
      type_name: "Outdoor Small",
      description: "Meja outdoor kecil untuk pasangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 3,
    position_x: 100,
    position_y: 0,
    orientation: "vertical"
  },
  {
    id: 10,
    table_number: "A4",
    capacity: 4,
    table_type: {
      id: 1,
      type_name: "Indoor Standard",
      description: "Meja standar untuk 4 orang di dalam ruangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 150,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 11,
    table_number: "B3",
    capacity: 6,
    table_type: {
      id: 3,
      type_name: "Indoor Large",
      description: "Meja besar untuk 6 orang",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 1,
    position_x: 100,
    position_y: 50,
    orientation: "horizontal"
  },
  {
    id: 12,
    table_number: "C2",
    capacity: 8,
    table_type: {
      id: 4,
      type_name: "VIP",
      description: "Meja VIP untuk 8 orang",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 2,
    position_x: 50,
    position_y: 0,
    orientation: "horizontal"
  },
  {
    id: 13,
    table_number: "O4",
    capacity: 4,
    table_type: {
      id: 5,
      type_name: "Outdoor Standard",
      description: "Meja outdoor dengan pemandangan",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 3,
    position_x: 0,
    position_y: 50,
    orientation: "horizontal"
  },
  {
    id: 14,
    table_number: "O5",
    capacity: 6,
    table_type: {
      id: 6,
      type_name: "Outdoor Large", // Assuming type 6 covers large/small for outdoor based on previous pattern or just consistency
      description: "Meja outdoor besar",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "available",
    floor: 3,
    position_x: 50,
    position_y: 50,
    orientation: "horizontal"
  },
];
