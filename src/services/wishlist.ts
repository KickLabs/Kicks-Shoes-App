import { API_BASE_URL } from "@/constants/config";

export interface WishlistItem {
  id: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  sku: string;
  mainImage: string;
  rating: number;
  isNew: boolean;
  price: {
    regular: number;
    discountPercent: number;
    isOnSale: boolean;
  };
  category: string;
  stock: number;
  sales: number;
  variants: {
    sizes: number[];
    colors: string[];
  };
}

export interface WishlistResponse {
  success: boolean;
  count: number;
  data: Array<{
    product: WishlistItem;
  }>;
}

export interface PaginatedWishlistResponse {
  success: boolean;
  data: Array<{
    product: WishlistItem;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class WishlistService {
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

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  async getWishlist(): Promise<any[]> {
    try {
      const response = await this.makeRequest("/api/favourites");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return [];
    }
  }

  async getWishlistItems(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedWishlistResponse> {
    try {
      const response = await this.makeRequest(
        `/api/favourites/user/${userId}?page=${page}&limit=${limit}`
      );

      // Transform the API response to match our expected format
      const transformedData = response.data.map((item: any) => ({
        product: {
          id: item.product._id,
          name: item.product.name,
          summary: item.product.summary || item.product.description || "",
          description: item.product.description || "",
          brand: item.product.brand || "",
          sku: item.product.sku || "",
          mainImage: item.product.mainImage || item.product.images?.[0] || "",
          rating: item.product.rating || 0,
          isNew: item.product.isNew || false,
          price: {
            regular: item.product.price || 0,
            discountPercent: item.product.discountPercent || 0,
            isOnSale: item.product.isOnSale || false,
          },
          category: item.product.category || "",
          stock: item.product.stock || item.product.inventory || 0,
          sales: item.product.sales || 0,
          variants: {
            sizes: item.product.variants?.sizes || [],
            colors: item.product.variants?.colors || [],
          },
        },
      }));

      return {
        success: response.success,
        data: transformedData,
        pagination: response.pagination || {
          page,
          limit,
          total: response.count || transformedData.length,
          pages: Math.ceil((response.count || transformedData.length) / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      throw error;
    }
  }

  async addToWishlist(
    productId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest("/api/favourites", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });

      return {
        success: response.success,
        message: response.message || "Product added to wishlist",
      };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  }

  async removeFromWishlist(
    productId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(`/api/favourites/${productId}`, {
        method: "DELETE",
      });

      return {
        success: response.success,
        message: response.message || "Product removed from wishlist",
      };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  }

  async clearWishlist(): Promise<{ success: boolean; message: string }> {
    try {
      // Note: This might need to be implemented in the backend
      // For now, we'll get all items and remove them one by one
      const response = await this.makeRequest("/api/favourites");

      if (response.success && response.data.length > 0) {
        const removePromises = response.data.map((item: any) =>
          this.removeFromWishlist(item.product._id)
        );

        await Promise.all(removePromises);
      }

      return {
        success: true,
        message: "Wishlist cleared successfully",
      };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();
