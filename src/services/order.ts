import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, Order } from "../types";
import cartService, { CartItem } from "./cart";
import { Linking } from "react-native";

export interface CreateOrderPayload {
  address: string;
  phone: string;
  deliveryMethod: string;
  paymentMethod: "vnpay" | "cod";
  note?: string;
  discount?: {
    code: string;
    discountAmount: number;
    type: "percentage" | "fixed";
    value: number;
  };
  finalTotal?: number;
}

class OrderService {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
      // Lấy sản phẩm trong giỏ hàng
      const cart = await cartService.getCart();
      const products = cart.items.map((item: CartItem) => ({
        id: item.productId, // Đúng với backend: id là _id của sản phẩm
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      }));

      // Map paymentMethod 'cod' thành 'cash_on_delivery' đúng chuẩn backend
      const paymentMethod =
        payload.paymentMethod === "cod"
          ? "cash_on_delivery"
          : payload.paymentMethod;

      // Tính tổng tiền (bao gồm phí ship nếu có)
      let deliveryFee = 0;
      if (payload.deliveryMethod === "standard") deliveryFee = 30000;
      const subtotalWithDelivery = cart.total + deliveryFee;

      // Apply discount if provided
      const discountAmount = payload.discount?.discountAmount || 0;
      const totalAmount =
        payload.finalTotal || subtotalWithDelivery - discountAmount;

      const orderPayload = {
        products,
        shippingAddress: payload.address,
        phone: payload.phone,
        shippingMethod: payload.deliveryMethod, // Đúng tên trường backend
        paymentMethod, // vnpay hoặc cash_on_delivery
        note: payload.note,
        totalAmount,
        totalPrice: totalAmount,
        shippingCost: deliveryFee,
        tax: 0,
        discount: discountAmount,
        // discountCode chỉ gửi nếu là string hợp lệ, giống web
        ...(payload.discount &&
        typeof payload.discount.code === "string" &&
        payload.discount.code.trim() !== ""
          ? { discountCode: payload.discount.code }
          : {}),
      };

      // 1. Tạo order trước
      let createdOrder;
      try {
        const response = await apiService.post<Order>(
          API_ENDPOINTS.ORDERS,
          orderPayload
        );
        createdOrder =
          (response as any).data?.data || (response as any).data || response;
      } catch (err: any) {
        // Log lỗi chi tiết từ backend
        if (err?.response?.data) {
          console.error("[OrderService] Backend error:", err.response.data);
          throw new Error(err.response.data.message || "Tạo đơn hàng thất bại");
        }
        throw err;
      }

      // 2. Nếu là VNPay, gọi API lấy paymentUrl và mở trình duyệt
      if (paymentMethod === "vnpay" && createdOrder && createdOrder._id) {
        // Log trước khi gọi API lấy link thanh toán VNPay
        console.log("[VNPay] About to call /payment/create", {
          orderId: createdOrder._id,
          amount: createdOrder.totalPrice,
        });
        try {
          const paymentRes = await apiService.post<any>("/payment/create", {
            orderId: createdOrder._id,
            amount: createdOrder.totalPrice,
            orderInfo: `Thanh toán đơn hàng #${createdOrder.orderNumber || createdOrder._id}`,
          });
          console.log("[VNPay] paymentRes:", paymentRes);
          const paymentUrl = paymentRes?.data?.paymentUrl;
          console.log("[VNPay] paymentUrl:", paymentUrl);
          if (paymentUrl) {
            Linking.openURL(paymentUrl);
          } else {
            console.error(
              "[VNPay] No paymentUrl found in VNPay response:",
              paymentRes
            );
          }
        } catch (error) {
          console.error("[VNPay] Error in /payment/create:", error);
          if (
            typeof error === "object" &&
            error !== null &&
            "response" in error
          ) {
            // @ts-ignore
            console.error("[VNPay] Error response:", error.response);
          }
        }
      }

      return createdOrder;
    } catch (error: any) {
      // Log lỗi chi tiết
      if (error?.response?.data) {
        console.error(
          "[OrderService] Error creating order:",
          error.response.data
        );
        throw new Error(error.response.data.message || "Tạo đơn hàng thất bại");
      }
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrders(page: number = 1, limit: number = 100) {
    try {
      // Get orders for current user with pagination
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get(
        `${API_ENDPOINTS.MY_ORDERS}?${queryParams}`
      );
      console.log("Orders response:", response);

      // Handle response structure: {success: true, data: {orders: [...], pagination: {...}}}
      let ordersData = response;
      if (response && (response as any).data) {
        ordersData = (response as any).data;
      }

      // Extract orders array
      if (ordersData && (ordersData as any).orders) {
        console.log("Extracted orders:", (ordersData as any).orders);
        return (ordersData as any).orders;
      }

      // Fallback to direct array
      return Array.isArray(ordersData) ? ordersData : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(orderId: string) {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.ORDER_DETAILS(orderId)
      );
      console.log("Order details response:", response);

      // Handle response structure
      let orderData = response;
      if (response && (response as any).data) {
        orderData = (response as any).data;
      }

      return orderData;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason?: string) {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.ORDERS}/${orderId}/cancel`,
        {
          reason,
        }
      );
      return response.data || response;
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  }

  async getUserOrders(userId?: string) {
    try {
      // If userId is provided, get orders for specific user (admin functionality)
      // If not provided, get orders for current logged-in user
      const endpoint = userId
        ? `${API_ENDPOINTS.ORDERS}/user/${userId}`
        : API_ENDPOINTS.ORDERS; // This should get current user's orders

      const response = await apiService.get(endpoint);
      console.log("User orders response:", response);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
        {
          status,
        }
      );
      return response.data || response;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
}

export default new OrderService();
