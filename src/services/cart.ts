import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { AxiosResponse } from "axios";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Helper function to transform cart data
const transformCartData = (cartData: any): CartResponse => {
  const transformedItems =
    cartData.items?.map((item: any) => {
      return {
        id: item._id || item.id || "",
        productId: item.product?._id || item.product || item.productId || "",
        name: item.product?.name || item.name || "Unknown Product",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image:
          item.product?.mainImage ||
          item.product?.images?.[0] ||
          item.image ||
          "",
        size: item.size || "",
        color: item.color || "",
      };
    }) || [];

  const total = Number(cartData.totalPrice) || Number(cartData.total) || 0;
  const itemCount = transformedItems.length;

  return {
    items: transformedItems,
    total,
    itemCount,
  };
};

class CartService {
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.CART);

      // Handle different response structures
      let cartData;
      if (response.data && response.data.items) {
        cartData = response.data;
      } else if ((response as any).items) {
        cartData = response;
      } else {
        cartData = { items: [], total: 0, itemCount: 0 };
      }

      return transformCartData(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      return { items: [], total: 0, itemCount: 0 };
    }
  }

  async addToCart(
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ): Promise<CartResponse> {
    try {
      const response = await apiService.post<any>(API_ENDPOINTS.CART, {
        product: productId,
        quantity,
        size,
        color,
      });

      // Handle different response structures
      let cartData;
      if (response.data && response.data.items) {
        cartData = response.data;
      } else if ((response as any).items) {
        cartData = response;
      } else {
        cartData = { items: [], total: 0, itemCount: 0 };
      }

      return transformCartData(cartData);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<CartResponse> {
    try {
      const response = await apiService.put<any>(
        API_ENDPOINTS.CART_ITEM(itemId),
        {
          quantity,
        }
      );

      // Handle different response structures
      let cartData;
      if (response.data && response.data.items) {
        cartData = response.data;
      } else if ((response as any).items) {
        cartData = response;
      } else {
        cartData = { items: [], total: 0, itemCount: 0 };
      }

      return transformCartData(cartData);
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  async removeFromCart(itemId: string): Promise<CartResponse> {
    try {
      const response = await apiService.delete<any>(
        API_ENDPOINTS.CART_ITEM(itemId)
      );

      // Handle different response structures
      let cartData;
      if (response.data && response.data.items) {
        cartData = response.data;
      } else if ((response as any).items) {
        cartData = response;
      } else {
        cartData = { items: [], total: 0, itemCount: 0 };
      }

      return transformCartData(cartData);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await apiService.delete(API_ENDPOINTS.CART);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }
}

export default new CartService();
