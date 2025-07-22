import { API_BASE_URL } from "@/constants/config";

export interface ProductVariant {
  sizes: number[];
  colors: string[];
}

export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  sku: string;
  mainImage: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  price: {
    regular: number;
    discountPercent: number;
    isOnSale: boolean;
  };
  category: string;
  stock: number;
  sales: number;
  variants: ProductVariant;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: number;
  color?: string;
  sortBy?: "price" | "rating" | "newest" | "popularity";
  sortOrder?: "asc" | "desc";
}

class ProductService {
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

  async getProducts(
    page: number = 1,
    limit: number = 10,
    filters?: ProductFilters
  ): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.brand && { brand: filters.brand }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.size && { size: filters.size.toString() }),
        ...(filters?.color && { color: filters.color }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await this.makeRequest(`/api/products?${queryParams}`);

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getProductById(
    productId: string
  ): Promise<{ success: boolean; data: Product }> {
    try {
      const response = await this.makeRequest(`/api/products/${productId}`);

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/products/search?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/products/category/${category}?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  async getProductsByBrand(
    brand: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/products/brand/${brand}?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching products by brand:", error);
      throw error;
    }
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await this.makeRequest(
        `/api/products/featured?limit=${limit}`
      );

      return {
        success: response.success,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  }

  async getNewProducts(limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await this.makeRequest(
        `/api/products/new?limit=${limit}`
      );

      return {
        success: response.success,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching new products:", error);
      throw error;
    }
  }

  async getDiscountedProducts(limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await this.makeRequest(
        `/api/products/discounted?limit=${limit}`
      );

      return {
        success: response.success,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      throw error;
    }
  }
}

export const productService = new ProductService();
