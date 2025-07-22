import { API_BASE_URL } from "@/constants/config";

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  count: number;
}

class CategoryService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem("accessToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await this.makeRequest("/api/categories");

      return {
        success: response.success,
        data: response.data || [],
        count: response.count || 0,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getCategoryById(
    categoryId: string
  ): Promise<{ success: boolean; data: Category }> {
    try {
      const response = await this.makeRequest(`/api/categories/${categoryId}`);

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  }

  async getActiveCategories(): Promise<CategoriesResponse> {
    try {
      const response = await this.makeRequest("/api/categories/active");

      return {
        success: response.success,
        data: response.data || [],
        count: response.count || 0,
      };
    } catch (error) {
      console.error("Error fetching active categories:", error);
      throw error;
    }
  }

  async getCategoryByName(
    name: string
  ): Promise<{ success: boolean; data: Category }> {
    try {
      const response = await this.makeRequest(
        `/api/categories/name/${encodeURIComponent(name)}`
      );

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching category by name:", error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
