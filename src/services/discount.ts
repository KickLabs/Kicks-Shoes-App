import apiService from "./api";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ValidateDiscountPayload {
  code: string;
  cartTotal: number;
  cartItems: CartItem[];
}

export interface DiscountValidationResult {
  isValid: boolean;
  discount: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description?: string;
    minPurchase: number;
    maxDiscount?: number;
  };
  discountAmount: number;
  finalTotal: number;
  message: string;
}

export interface DiscountValidationResponse {
  success: boolean;
  data: DiscountValidationResult;
  message?: string;
}

class DiscountService {
  /**
   * Validate discount code via backend API
   */
  async validateDiscount(
    payload: ValidateDiscountPayload
  ): Promise<DiscountValidationResult> {
    try {
      const response = await apiService.post<DiscountValidationResponse>(
        "/discounts/validate",
        payload
      );

      // Handle different response structures
      const responseData = response as any;

      // Check if API call was successful
      if (responseData.success === true && responseData.data) {
        // Return the discount validation result directly
        return responseData.data;
      } else if (responseData.success === false) {
        // API returned error
        throw new Error(responseData.message || "Invalid discount code");
      } else {
        // Unexpected response structure
        throw new Error("Unexpected API response structure");
      }
    } catch (error: any) {
      console.error("❌ Discount validation failed:", error);

      // Return proper error result
      return {
        isValid: false,
        discount: {
          code: payload.code,
          type: "fixed",
          value: 0,
          minPurchase: 0,
        },
        discountAmount: 0,
        finalTotal: payload.cartTotal,
        message:
          error.response?.data?.message ||
          error.message ||
          "Invalid discount code or network error. Please try again.",
      };
    }
  }

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(
    cartTotal: number,
    discount: {
      type: "percentage" | "fixed";
      value: number;
      maxDiscount?: number;
    }
  ): number {
    if (discount.type === "percentage") {
      const discountAmount = (cartTotal * discount.value) / 100;
      return discount.maxDiscount
        ? Math.min(discountAmount, discount.maxDiscount)
        : discountAmount;
    } else {
      return Math.min(discount.value, cartTotal);
    }
  }

  /**
   * Format discount code for display
   */
  formatDiscountCode(code: string): string {
    return code.toUpperCase().trim();
  }

  /**
   * Check if discount code format is valid
   */
  isValidCodeFormat(code: string): boolean {
    const trimmedCode = code.trim();
    return trimmedCode.length >= 3 && trimmedCode.length <= 50;
  }
}

const discountService = new DiscountService();
export default discountService;
