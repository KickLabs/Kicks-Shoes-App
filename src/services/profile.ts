import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";

export interface UserStats {
  orders: number;
  wishlist: number;
  reviews: number;
}

class ProfileService {
  /**
   * Get user statistics (orders, wishlist, reviews count)
   */
  async getUserStats(): Promise<UserStats> {
    try {
      console.log("=== ProfileService: Fetching user stats ===");

      // Use Promise.allSettled to handle partial failures gracefully
      const [ordersResult, wishlistResult, reviewsResult] =
        await Promise.allSettled([
          this.getOrdersCount(),
          this.getWishlistCount(),
          this.getReviewsCount(),
        ]);

      const stats: UserStats = {
        orders: ordersResult.status === "fulfilled" ? ordersResult.value : 0,
        wishlist:
          wishlistResult.status === "fulfilled" ? wishlistResult.value : 0,
        reviews: reviewsResult.status === "fulfilled" ? reviewsResult.value : 0,
      };

      console.log("ProfileService: Final stats:", stats);
      return stats;
    } catch (error) {
      console.error("ProfileService: Error fetching user stats:", error);
      // Return default values on complete failure
      return {
        orders: 0,
        wishlist: 0,
        reviews: 0,
      };
    }
  }

  private async getOrdersCount(): Promise<number> {
    try {
      console.log("ProfileService: Fetching orders count...");
      const response = (await apiService.get(
        `${API_ENDPOINTS.MY_ORDERS}?page=1&limit=1`
      )) as any;

      // Handle different response structures
      let count = 0;
      if (response.data?.pagination?.total) {
        count = response.data.pagination.total;
      } else if (response.pagination?.total) {
        count = response.pagination.total;
      } else if (response.data?.orders) {
        count = Array.isArray(response.data.orders)
          ? response.data.orders.length
          : 0;
      } else if (response.orders) {
        count = Array.isArray(response.orders) ? response.orders.length : 0;
      }

      console.log("ProfileService: Orders count:", count);
      return count;
    } catch (error) {
      console.error("ProfileService: Error fetching orders count:", error);
      return 0;
    }
  }

  private async getWishlistCount(): Promise<number> {
    try {
      console.log("ProfileService: Fetching wishlist count...");
      const response = (await apiService.get(
        `${API_ENDPOINTS.WISHLIST}?page=1&limit=1`
      )) as any;

      // Handle different response structures
      let count = 0;
      if (response.count) {
        count = response.count;
      } else if (response.pagination?.total) {
        count = response.pagination.total;
      } else if (response.data?.length) {
        count = response.data.length;
      } else if (Array.isArray(response.data)) {
        count = response.data.length;
      }

      console.log("ProfileService: Wishlist count:", count);
      return count;
    } catch (error) {
      console.error("ProfileService: Error fetching wishlist count:", error);
      return 0;
    }
  }

  private async getReviewsCount(): Promise<number> {
    try {
      console.log("ProfileService: Fetching reviews count...");
      // Note: This endpoint might need adjustment based on your backend
      const response = (await apiService.get(
        "/feedback?page=1&limit=1"
      )) as any;

      // Handle different response structures
      let count = 0;
      if (response.count) {
        count = response.count;
      } else if (response.pagination?.total) {
        count = response.pagination.total;
      } else if (response.data?.length) {
        count = response.data.length;
      } else if (Array.isArray(response.data)) {
        count = response.data.length;
      }

      console.log("ProfileService: Reviews count:", count);
      return count;
    } catch (error) {
      console.error("ProfileService: Error fetching reviews count:", error);
      return 0;
    }
  }
}

const profileService = new ProfileService();
export default profileService;
