import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
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

// Helper function to check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    return !!token;
  } catch {
    return false;
  }
};

// Helper function to transform cart data
const transformCartData = (cartData: any): CartResponse => {
  const transformedItems =
    cartData.items?.map((item: any) => {
      // Try to get the image from cart item first (this should be the image for selected color)
      let itemImage = item.image || item.selectedImage;

      // If no image in cart item, try to get from product inventory based on color
      if (!itemImage && item.product && item.color) {
        const colorVariant = item.product.inventory?.find(
          (inv: any) => inv.color === item.color
        );
        if (colorVariant && colorVariant.images?.length > 0) {
          itemImage = colorVariant.images[0];
        }
      }

      // Final fallback to product's main image
      if (!itemImage) {
        itemImage = item.product?.mainImage || item.product?.images?.[0] || "";
      }

      // Get original price from product data
      let originalPrice = undefined;
      if (item.product && item.product.price) {
        if (typeof item.product.price === "object") {
          originalPrice = item.product.price.regular;
        } else {
          originalPrice = item.product.price;
        }
      }

      return {
        id: item._id || item.id || "",
        productId: item.product?._id || item.product || item.productId || "",
        name: item.product?.name || item.name || "Unknown Product",
        price: Number(item.price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        quantity: Number(item.quantity) || 1,
        image: itemImage,
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
      // Check if user is authenticated
      if (!(await isAuthenticated())) {
        console.log("Cart: User not authenticated, returning empty cart");
        return { items: [], total: 0, itemCount: 0 };
      }

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
    color?: string,
    price?: number,
    image?: string
  ): Promise<CartResponse> {
    try {
      const response = await apiService.post<any>(API_ENDPOINTS.CART, {
        product: productId,
        quantity,
        size,
        color,
        price,
        image,
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
