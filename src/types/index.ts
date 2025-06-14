import { NavigatorScreenParams } from "@react-navigation/native";

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Navigation Types
export type MainStackParamList = {
  Home: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
