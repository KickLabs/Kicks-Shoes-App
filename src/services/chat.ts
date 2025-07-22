import { API_BASE_URL } from "@/constants/config";
import { store } from "@/store";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "user" | "admin";
  message: string;
  messageType: "text" | "image" | "file";
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  adminId?: string;
  adminName?: string;
  subject: string;
  status: "active" | "closed" | "pending";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
  messageType?: "text" | "image" | "file";
  attachments?: string[];
  subject?: string; // For new conversations
}

class ChatService {
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

  async getConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> {
    try {
      // Lấy userId từ Redux store
      let userId = undefined;
      try {
        const state = store.getState();
        userId = state.auth?.user?.id || state.auth?.user?._id;
      } catch {}
      // Nếu chưa có userId, thử lấy từ AsyncStorage
      if (!userId) {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const userInfoStr = await AsyncStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo?.id || userInfo?._id;
        }
      }
      if (!userId) throw new Error("No userId found for chat API");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        userId: userId,
      });
      const response = await this.makeRequest(
        `/api/chat/conversations?${queryParams}`
      );
      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  async getConversationById(
    conversationId: string
  ): Promise<{ success: boolean; data: Conversation }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}`
      );

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}/messages?${queryParams}`
      );

      console.log("[chatService] Raw response from BE:", response);

      // Lấy userId hiện tại để xác định senderType
      let userId = undefined;
      try {
        const state = store.getState();
        userId = state.auth?.user?.id || (state.auth?.user as any)?._id;
      } catch {}
      if (!userId) {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const userInfoStr = await AsyncStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          userId = userInfo?.id || userInfo?._id;
        }
      }

      // Map lại dữ liệu
      const mapped = (
        Array.isArray(response) ? response : response.data || []
      ).map((msg: any) => {
        let senderId = msg.sender;
        if (
          msg.sender &&
          typeof msg.sender === "object" &&
          "_id" in msg.sender
        ) {
          senderId = msg.sender._id;
        }
        return {
          id: msg._id,
          conversationId: msg.conversationId,
          senderId,
          senderType: userId && senderId == userId ? "user" : "admin",
          message: msg.content,
          messageType: "text", // BE chưa có, mặc định text
          attachments: [], // BE chưa có
          isRead: true, // BE chưa có, mặc định true
          createdAt: msg.timestamp || msg.createdAt,
          updatedAt: msg.timestamp || msg.updatedAt || msg.createdAt,
        };
      });

      console.log("[chatService] Mapped chat messages:", mapped);

      return {
        success: true,
        data: mapped,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async sendMessage(
    messageData: SendMessageRequest
  ): Promise<{ success: boolean; data: ChatMessage; message: string }> {
    try {
      const endpoint = messageData.conversationId
        ? `/api/chat/conversations/${messageData.conversationId}/messages`
        : "/api/chat/conversations";

      const response = await this.makeRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(messageData),
      });

      console.log("[chatService] Send message response:", response);

      // Map response từ BE về format ChatMessage
      let mappedMessage = null;
      if (response.data || response._id) {
        const rawMessage = response.data || response;
        // Lấy userId để xác định senderType
        let userId = undefined;
        try {
          const state = store.getState();
          userId = state.auth?.user?.id || (state.auth?.user as any)?._id;
        } catch {}
        if (!userId) {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          const userInfoStr = await AsyncStorage.getItem("userInfo");
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo?.id || userInfo?._id;
          }
        }

        let senderId = rawMessage.sender;
        if (
          rawMessage.sender &&
          typeof rawMessage.sender === "object" &&
          "_id" in rawMessage.sender
        ) {
          senderId = rawMessage.sender._id;
        }

        mappedMessage = {
          id: rawMessage._id,
          conversationId: rawMessage.conversationId,
          senderId,
          senderType: userId && senderId == userId ? "user" : "admin",
          message: rawMessage.content,
          messageType: "text",
          attachments: [],
          isRead: true,
          createdAt:
            rawMessage.timestamp ||
            rawMessage.createdAt ||
            new Date().toISOString(),
          updatedAt:
            rawMessage.timestamp ||
            rawMessage.updatedAt ||
            rawMessage.createdAt ||
            new Date().toISOString(),
        } as ChatMessage;
      }

      return {
        success: response.success !== false,
        data: mappedMessage || ({} as ChatMessage),
        message: response.message || "Message sent successfully",
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markMessageAsRead(
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/messages/${messageId}/read`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "Message marked as read",
      };
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async markConversationAsRead(
    conversationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}/read`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "Conversation marked as read",
      };
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }

  async deleteMessage(
    messageId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      return {
        success: response.success,
        message: response.message || "Message deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  async closeConversation(
    conversationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}/close`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "Conversation closed successfully",
      };
    } catch (error) {
      console.error("Error closing conversation:", error);
      throw error;
    }
  }

  async reopenConversation(
    conversationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}/reopen`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        message: response.message || "Conversation reopened successfully",
      };
    } catch (error) {
      console.error("Error reopening conversation:", error);
      throw error;
    }
  }

  async markAsRead(
    conversationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/chat/conversations/${conversationId}/read`,
        {
          method: "PATCH",
        }
      );

      return {
        success: response.success,
        message: response.message || "Marked as read",
      };
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }

  async uploadChatAttachment(
    file: any
  ): Promise<{ success: boolean; url: string; message: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = await this.getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let fetch set it automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        url: result.url,
        message: result.message || "File uploaded successfully",
      };
    } catch (error) {
      console.error("Error uploading chat attachment:", error);
      throw error;
    }
  }

  async getUnreadMessagesCount(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await this.makeRequest("/api/chat/unread-count");

      return {
        success: response.success,
        count: response.count || 0,
      };
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
