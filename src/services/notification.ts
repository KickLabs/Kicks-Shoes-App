import { API_BASE_URL } from "@/constants/config";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "chat" | "review" | "wishlist";
  isRead: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  reviews: boolean;
  chat: boolean;
  system: boolean;
}

class NotificationService {
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

  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/notifications?${queryParams}`
      );

      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
        unreadCount: response.unreadCount || 0,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getUnreadNotifications(): Promise<NotificationsResponse> {
    try {
      const response = await this.makeRequest("/api/notifications/unread");

      return {
        success: response.success,
        data: response.data || [],
        unreadCount: response.unreadCount || 0,
      };
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "Notification marked as read",
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        "/api/notifications/mark-all-read",
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "All notifications marked as read",
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      return {
        success: response.success,
        message: response.message || "Notification deleted",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await this.makeRequest("/api/notifications/clear-all", {
        method: "DELETE",
      });

      return {
        success: response.success,
        message: response.message || "All notifications cleared",
      };
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw error;
    }
  }

  async getNotificationSettings(): Promise<{
    success: boolean;
    data: NotificationSettings;
  }> {
    try {
      const response = await this.makeRequest("/api/notifications/settings");

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      throw error;
    }
  }

  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<{
    success: boolean;
    data: NotificationSettings;
    message: string;
  }> {
    try {
      const response = await this.makeRequest("/api/notifications/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Notification settings updated",
      };
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await this.makeRequest(
        "/api/notifications/unread-count"
      );

      return {
        success: response.success,
        count: response.count || 0,
      };
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  async registerPushToken(
    pushToken: string,
    platform: "ios" | "android"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        "/api/notifications/register-push-token",
        {
          method: "POST",
          body: JSON.stringify({ pushToken, platform }),
        }
      );

      return {
        success: response.success,
        message: response.message || "Push token registered",
      };
    } catch (error) {
      console.error("Error registering push token:", error);
      throw error;
    }
  }

  async unregisterPushToken(
    pushToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        "/api/notifications/unregister-push-token",
        {
          method: "POST",
          body: JSON.stringify({ pushToken }),
        }
      );

      return {
        success: response.success,
        message: response.message || "Push token unregistered",
      };
    } catch (error) {
      console.error("Error unregistering push token:", error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
