export const API_URL = "http://192.168.1.71:3000/api";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // User
  USER_PROFILE: "/auth/me",
  UPDATE_PROFILE: "/auth/update-profile",
  CHANGE_PASSWORD: "/auth/change-password",

  // Products
  PRODUCTS: "/products",
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  PRODUCT_REVIEWS: (id: string) => `/products/${id}/reviews`,

  // Categories
  CATEGORIES: "/categories",

  // Cart
  CART: "/cart",
  CART_ITEM: (id: string) => `/cart/${id}`,

  // Wishlist/Favourites
  WISHLIST: "/favourites",
  WISHLIST_ITEM: (id: string) => `/favourites/${id}`,

  // Orders
  ORDERS: "/orders",
  MY_ORDERS: "/orders/my-orders",
  ORDER_DETAILS: (id: string) => `/orders/${id}`,

  // Address
  ADDRESSES: "/addresses",
  ADDRESS: (id: string) => `/addresses/${id}`,
};

export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const API_TIMEOUT = 30000; // 30 seconds

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Unauthorized. Please login again.",
  FORBIDDEN: "Forbidden. You do not have permission to access this resource.",
  NOT_FOUND: "Resource not found.",
  VALIDATION_ERROR: "Validation error. Please check your input.",
};
