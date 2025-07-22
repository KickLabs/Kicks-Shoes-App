import { API_BASE_URL } from "@/constants/config";

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  productId: string;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      [key: number]: number;
    };
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  images?: string[];
}

class ReviewService {
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

  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/feedback/product/${productId}?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
        stats: response.stats,
      };
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  }

  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/feedback/user/${userId}?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      throw error;
    }
  }

  async createReview(
    reviewData: CreateReviewRequest
  ): Promise<{ success: boolean; data: Review; message: string }> {
    try {
      const response = await this.makeRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(reviewData),
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Review created successfully",
      };
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewRequest
  ): Promise<{ success: boolean; data: Review; message: string }> {
    try {
      const response = await this.makeRequest(`/api/feedback/${reviewId}`, {
        method: "PUT",
        body: JSON.stringify(reviewData),
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Review updated successfully",
      };
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  async deleteReview(
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(`/api/feedback/${reviewId}`, {
        method: "DELETE",
      });

      return {
        success: response.success,
        message: response.message || "Review deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }

  async getReviewById(
    reviewId: string
  ): Promise<{ success: boolean; data: Review }> {
    try {
      const response = await this.makeRequest(`/api/feedback/${reviewId}`);

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  }

  async likeReview(
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/feedback/${reviewId}/like`,
        {
          method: "POST",
        }
      );

      return {
        success: response.success,
        message: response.message || "Review liked successfully",
      };
    } catch (error) {
      console.error("Error liking review:", error);
      throw error;
    }
  }

  async unlikeReview(
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/feedback/${reviewId}/unlike`,
        {
          method: "POST",
        }
      );

      return {
        success: response.success,
        message: response.message || "Review unliked successfully",
      };
    } catch (error) {
      console.error("Error unliking review:", error);
      throw error;
    }
  }

  async reportReview(
    reviewId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/feedback/${reviewId}/report`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        }
      );

      return {
        success: response.success,
        message: response.message || "Review reported successfully",
      };
    } catch (error) {
      console.error("Error reporting review:", error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
