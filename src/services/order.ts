import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, Order } from "../types";

export interface CreateOrderPayload {
  address: string;
  phone: string;
  deliveryMethod: string;
  note?: string;
}

class OrderService {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
      const response = await apiService.post<Order>(
        API_ENDPOINTS.ORDERS,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrders() {
    try {
      // Get orders for current user
      const response = await apiService.get(API_ENDPOINTS.MY_ORDERS);
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
