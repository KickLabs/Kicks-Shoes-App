import apiService from "./api";

export interface RedeemPointsPayload {
  points: number;
  discountAmount: number;
  description?: string;
}

export interface RewardPointStats {
  availablePoints: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
}

export interface DiscountInfo {
  code: string;
  value: number;
  description: string;
  startDate: string;
  endDate: string;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  data: {
    rewardPoint: any;
    discount: DiscountInfo;
  };
}

class RewardPointService {
  /**
   * Get user's total reward points
   */
  async getUserStats(): Promise<RewardPointStats> {
    try {
      const response = await apiService.get("/reward-points/total");
      console.log("User reward stats response:", response);

      // Handle response structure - apiService returns AxiosResponse.data
      const data = (response as any).data || response;

      return {
        availablePoints: data.availablePoints || 0,
        totalEarned: data.totalEarned || 0,
        totalRedeemed: data.totalRedeemed || 0,
        totalExpired: data.totalExpired || 0,
      };
    } catch (error) {
      console.error("Error fetching user reward stats:", error);
      throw error;
    }
  }

  /**
   * Redeem points for discount
   */
  async redeemPoints(payload: RedeemPointsPayload): Promise<RedeemResponse> {
    try {
      console.log("Redeeming points:", payload);

      const response = await apiService.post<RedeemResponse>(
        "/reward-points/redeem",
        payload
      );

      console.log("Redeem points response:", response);

      // Response structure is already correct from backend
      // Backend returns: { success: true, message: "...", data: { discount: {...}, rewardPoint: {...} } }
      return response as unknown as RedeemResponse;
    } catch (error) {
      console.error("Error redeeming points:", error);
      throw error;
    }
  }

  /**
   * Get user's reward point history
   */
  async getRewardHistory(page: number = 1, limit: number = 20) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get(
        `/reward-points/user?${queryParams}`
      );

      console.log("Reward history response:", response);

      // Handle response structure - apiService returns AxiosResponse.data
      const data = (response as any).data || response;

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching reward history:", error);
      throw error;
    }
  }

  /**
   * Calculate discount amount based on points
   */
  calculateDiscountAmount(points: number): number {
    if (points < 10) return 0;

    if (points < 50) {
      return points * 1000; // 1 point = 1000 VND
    } else if (points < 100) {
      return points * 1100; // 10% bonus
    } else if (points < 200) {
      return points * 1200; // 20% bonus
    } else if (points < 500) {
      return points * 1250; // 25% bonus
    } else {
      return points * 1300; // 30% bonus
    }
  }

  /**
   * Get redemption rate for points
   */
  getRedemptionRate(points: number): number {
    if (points < 10) return 1000;
    if (points < 50) return 1000;
    if (points < 100) return 1100;
    if (points < 200) return 1200;
    if (points < 500) return 1250;
    return 1300;
  }
}

const rewardPointService = new RewardPointService();
export default rewardPointService;
