import { API_BASE_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  totalConversations: number;
}

interface ApiUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price:
    | {
        regular: number;
        discountPercent: number;
        isOnSale: boolean;
      }
    | number;
  finalPrice?: number;
  stock: number;
  quantity?: number;
  category:
    | {
        _id: string;
        name: string;
      }
    | string;
  images: string[];
  mainImage?: string;
  status: boolean;
  inStock?: boolean;
  isPublished?: boolean;
  createdAt: string;
}

interface ApiCategory {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: boolean; // Đổi từ isActive sang status
  productsCount?: number; // Thêm trường productsCount
  productCount?: number;
  slug?: string; // Thêm trường slug
  createdAt: string;
  updatedAt?: string; // Thêm trường updatedAt
}

interface ApiOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    fullName: string;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
  items: any[];
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  console.log(
    "[AdminService] Token retrieved:",
    token ? "✅ Found" : "❌ Not found"
  );

  if (!token) {
    throw new Error("No authentication token found. Please login again.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Admin Dashboard Stats
export const getAdminStats = async (): Promise<DashboardStats> => {
  try {
    console.log("[AdminService] Fetching admin stats...");
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/dashboard/admin/stats`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[AdminService] Admin stats API response:", result);

    // Extract stats from nested response
    const data = result.data || result;

    return {
      totalUsers: data.totalUsers || 0,
      totalProducts: data.totalProducts || 0,
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      totalCategories: data.totalCategories || 0,
      totalConversations: data.totalConversations || 0,
    };
  } catch (error) {
    console.error("[AdminService] Error fetching admin stats:", error);
    throw error;
  }
};

// Get All Users
export const getAdminUsers = async (): Promise<ApiUser[]> => {
  try {
    console.log("[AdminService] Fetching users...");
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/dashboard/admin/users`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[AdminService] Users API response:", result);

    // Extract users from nested response
    const users = result.data?.users || result.data || result || [];
    console.log("[AdminService] Users received:", users.length);

    return users;
  } catch (error) {
    console.error("[AdminService] Error fetching users:", error);
    throw error;
  }
};

// Get All Products
export const getAdminProducts = async (): Promise<ApiProduct[]> => {
  try {
    console.log("[AdminService] Fetching products...");
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[AdminService] Products API response:", result);

    // Extract products from nested response
    const products = result.data?.products || result.data || result || [];
    console.log("[AdminService] Products received:", products.length);

    return products;
  } catch (error) {
    console.error("[AdminService] Error fetching products:", error);
    throw error;
  }
};

// Get All Categories
export const getAdminCategories = async (): Promise<ApiCategory[]> => {
  try {
    console.log("[AdminService] Fetching categories...");
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/admin/categories`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[AdminService] Categories API response:", result);

    // Extract categories from nested response
    const categories = result.data?.categories || result.data || result || [];
    console.log("[AdminService] Categories received:", categories.length);

    return categories;
  } catch (error) {
    console.error("[AdminService] Error fetching categories:", error);
    throw error;
  }
};

// Get All Orders
export const getAdminOrders = async (): Promise<ApiOrder[]> => {
  try {
    console.log("[AdminService] Fetching orders...");
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/orders?limit=100`, // Use orders endpoint with limit
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[AdminService] Orders API response:", result);

    // Extract orders from response.data.orders (pagination format)
    const orders = result.data?.orders || result.data || [];
    console.log("[AdminService] Orders received:", orders.length);

    return orders;
  } catch (error) {
    console.error("[AdminService] Error fetching orders:", error);
    throw error;
  }
};

// Ban/Unban User
export const toggleUserStatus = async (
  userId: string,
  shouldBan: boolean
): Promise<void> => {
  try {
    console.log(
      `[AdminService] ${shouldBan ? "Banning" : "Unbanning"} user:`,
      userId
    );
    const headers = await getAuthHeaders();

    const endpoint = shouldBan
      ? `${API_BASE_URL}/api/dashboard/admin/users/${userId}/ban`
      : `${API_BASE_URL}/api/dashboard/admin/users/${userId}/unban`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(
      `[AdminService] User ${shouldBan ? "banned" : "unbanned"} successfully`
    );
  } catch (error) {
    console.error(
      `[AdminService] Error ${shouldBan ? "banning" : "unbanning"} user:`,
      error
    );
    throw error;
  }
};

// Create Category
export const createCategory = async (categoryData: {
  name: string;
  description: string;
}): Promise<ApiCategory> => {
  try {
    console.log("[AdminService] Creating category:", categoryData);
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/admin/categories`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(categoryData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[AdminService] Category created:", data);

    return data;
  } catch (error) {
    console.error("[AdminService] Error creating category:", error);
    throw error;
  }
};

// Update Category
export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name?: string;
    description?: string;
    status?: boolean;
  }
): Promise<ApiCategory> => {
  try {
    console.log("[AdminService] Updating category:", categoryId, categoryData);
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(categoryData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[AdminService] Category updated:", data);

    return data;
  } catch (error) {
    console.error("[AdminService] Error updating category:", error);
    throw error;
  }
};

// Delete Category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    console.log("[AdminService] Deleting category:", categoryId);
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("[AdminService] Category deleted successfully");
  } catch (error) {
    console.error("[AdminService] Error deleting category:", error);
    throw error;
  }
};

// Toggle Category Status
export const toggleCategoryStatus = async (
  categoryId: string,
  shouldActivate: boolean
): Promise<void> => {
  try {
    console.log(
      `[AdminService] ${shouldActivate ? "Activating" : "Deactivating"} category:`,
      categoryId
    );
    const headers = await getAuthHeaders();

    const endpoint = shouldActivate
      ? `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/activate`
      : `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/deactivate`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(
      `[AdminService] Category ${shouldActivate ? "activated" : "deactivated"} successfully`
    );
  } catch (error) {
    console.error(
      `[AdminService] Error ${shouldActivate ? "activating" : "deactivating"} category:`,
      error
    );
    throw error;
  }
};
