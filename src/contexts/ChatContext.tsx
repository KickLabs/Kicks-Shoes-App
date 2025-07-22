import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { chatService, ChatMessage, Conversation } from "@/services/chat";
import { io, Socket } from "socket.io-client";
import { CHAT_CONFIG } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatContextType {
  // Conversations
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;

  // Messages
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sendMessage: (message: string, attachments?: string[]) => Promise<void>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;

  // Real-time
  isConnected: boolean;
  socket: Socket | null;

  // State
  loading: boolean;
  error: string | null;
  unreadCount: number;

  // Actions
  loadConversations: () => Promise<void>;
  createNewConversation: (message: string, subject?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  uploadFile: (file: any) => Promise<string>;

  // Socket Management
  joinConversationRoom: (conversationId: string) => void;
  leaveConversationRoom: (conversationId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize Socket Connection
  useEffect(() => {
    initializeSocket();
    return () => {
      if (socket) {
        console.log("🔗 Cleaning up socket connection");
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []); // Empty dependency array to run only once

  const initializeSocket = async () => {
    try {
      // Prevent multiple socket connections
      if (socket && socket.connected) {
        console.log("🔗 Socket already connected, skipping initialization");
        return;
      }

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.log("🔗 No access token found, skipping socket connection");
        setError("Authentication required for chat");
        return;
      }

      console.log(
        "🔗 Initializing socket connection to:",
        CHAT_CONFIG.SOCKET_URL
      );

      const socketInstance = io(CHAT_CONFIG.SOCKET_URL, {
        auth: {
          token: `Bearer ${token}`,
        },
        transports: ["websocket", "polling"],
        timeout: CHAT_CONFIG.CHAT_TIMEOUT,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });

      socketInstance.on("connect", () => {
        console.log("🔗 Socket connected successfully");
        setIsConnected(true);
        setError(null); // Clear any previous errors

        // Join current conversation room if exists
        if (
          currentConversation &&
          currentConversation.id !== "ai" &&
          currentConversation.id !== "shop"
        ) {
          socketInstance.emit("join_conversation", currentConversation.id);
        }
      });

      socketInstance.on("disconnect", () => {
        console.log("🔗 Socket disconnected");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error: any) => {
        console.error("🔗 Socket connection error:", error);
        setIsConnected(false);
        if (error.message?.includes("Authentication error")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError(
            "Failed to connect to chat server. Please check your connection."
          );
        }
      });

      socketInstance.on("reconnect", (attemptNumber: number) => {
        console.log(`🔗 Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setError(null);

        // Rejoin current conversation room after reconnection
        if (
          currentConversation &&
          currentConversation.id !== "ai" &&
          currentConversation.id !== "shop"
        ) {
          socketInstance.emit("join_conversation", currentConversation.id);
        }
      });

      socketInstance.on("reconnect_error", (error: any) => {
        console.error("🔗 Socket reconnection error:", error);
        setIsConnected(false);
        setError("Unable to reconnect to chat server");
      });

      socketInstance.on("reconnect_failed", () => {
        console.error("🔗 Socket reconnection failed");
        setIsConnected(false);
        setError("Chat connection failed. Please refresh the app.");
      });

      // Listen for new messages
      socketInstance.on("newMessage", (message: ChatMessage) => {
        console.log("📨 New message received:", message);
        setMessages((prev) => [...prev, message]);

        // Update unread count if not current conversation
        if (
          !currentConversation ||
          message.conversationId !== currentConversation.id
        ) {
          setUnreadCount((prev) => prev + 1);
        }

        // Update conversation last message
        updateConversationLastMessage(message);
      });

      // Listen for user join/leave events
      socketInstance.on("user_joined", ({ userId, userName, timestamp }) => {
        console.log(`👤 User ${userName} joined the conversation`);
        // Could show a system message or notification
      });

      socketInstance.on("user_left", ({ userId, userName, timestamp }) => {
        console.log(`👤 User ${userName} left the conversation`);
        // Could show a system message or notification
      });

      // Listen for message status updates
      socketInstance.on(
        "messageRead",
        ({
          conversationId,
          messageIds,
          readBy,
          readAt,
        }: {
          conversationId: string;
          messageIds: string[];
          readBy: string;
          readAt: string;
        }) => {
          console.log(`📖 Messages marked as read by ${readBy}:`, messageIds);
          setMessages((prev) =>
            prev.map((msg) =>
              messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
          );
        }
      );

      // Listen for typing indicators
      socketInstance.on(
        "userTyping",
        ({
          conversationId,
          userId,
          userName,
          isTyping,
        }: {
          conversationId: string;
          userId: string;
          userName: string;
          isTyping: boolean;
        }) => {
          console.log(
            `⌨️ ${userName} is ${isTyping ? "typing" : "stopped typing"}`
          );
          // Update typing state - you can add this to context state if needed
          // setTypingUsers(prev => isTyping
          //   ? [...prev.filter(u => u.userId !== userId), { userId, userName, conversationId }]
          //   : prev.filter(u => u.userId !== userId)
          // );
        }
      );

      // Handle general errors
      socketInstance.on("error", (error: any) => {
        console.error("🔗 Socket error:", error);
        setError(error.message || "Connection error. Please try again.");
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error("🔗 Error initializing socket:", error);
      setError("Failed to initialize chat connection");
      setIsConnected(false);
    }
  };

  const updateConversationLastMessage = (message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessage: message.message,
              lastMessageAt: message.createdAt,
              unreadCount: conv.unreadCount + 1,
            }
          : conv
      )
    );
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data);

        // Calculate total unread count
        const totalUnread = response.data.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      setError(error.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await chatService.getMessages(conversationId, page);
      if (response.success) {
        if (page === 1) {
          setMessages(response.data); // Không reverse, giữ thứ tự tăng dần
        } else {
          setMessages((prev) => [...prev, ...response.data]); // Thêm messages mới vào cuối
        }
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      setError(error.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (message: string, attachments?: string[]) => {
    if (!currentConversation) {
      throw new Error("No active conversation");
    }

    try {
      setError(null);

      // For real conversations, try socket first, fallback to HTTP
      if (
        socket &&
        socket.connected &&
        currentConversation.id !== "ai" &&
        currentConversation.id !== "shop"
      ) {
        console.log("📤 Sending message via socket");

        // Send via socket for realtime experience
        socket.emit("send_message", {
          conversationId: currentConversation.id,
          content: message,
          receiver: "6845be4f54a7582c1d2109b8", // Default shop ID
        });

        // Message will be received via socket event, no need to add manually
        return;
      }

      // Fallback to HTTP API for AI/Shop or when socket not available
      console.log("📤 Sending message via HTTP API");
      const response = await chatService.sendMessage({
        conversationId: currentConversation.id,
        message,
        messageType: attachments && attachments.length > 0 ? "image" : "text",
        attachments,
      });

      if (response.success) {
        // Optimistically add message to UI
        const newMessage: ChatMessage = {
          ...response.data,
          senderId: "user", // We know it's from user
          senderType: "user" as const,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Socket will broadcast this to other clients
        if (socket) {
          socket.emit("newMessage", newMessage);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message");
      throw error;
    }
  };

  // Join conversation room
  const joinConversationRoom = (conversationId: string) => {
    if (
      socket &&
      socket.connected &&
      conversationId !== "ai" &&
      conversationId !== "shop"
    ) {
      console.log(`🏠 Joining conversation room: ${conversationId}`);
      socket.emit("join_conversation", conversationId);
    }
  };

  // Leave conversation room
  const leaveConversationRoom = (conversationId: string) => {
    if (
      socket &&
      socket.connected &&
      conversationId !== "ai" &&
      conversationId !== "shop"
    ) {
      console.log(`🚪 Leaving conversation room: ${conversationId}`);
      socket.emit("leave_conversation", conversationId);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (
      socket &&
      socket.connected &&
      conversationId !== "ai" &&
      conversationId !== "shop"
    ) {
      const event = isTyping ? "typing_start" : "typing_stop";
      socket.emit(event, { conversationId });
      console.log(
        `⌨️ Sent typing indicator: ${isTyping ? "started" : "stopped"} for ${conversationId}`
      );
    }
  };

  // Create new conversation
  const createNewConversation = async (
    message: string,
    subject = "Support Request"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await chatService.sendMessage({
        message,
        subject,
        messageType: "text",
      });

      if (response.success) {
        // Refresh conversations to get the new one
        await loadConversations();

        // Find and set the new conversation as current
        const conversations = await chatService.getConversations();
        if (conversations.success && conversations.data.length > 0) {
          const newConversation = conversations.data[0];
          setCurrentConversation(newConversation);

          // Join the new conversation room
          joinConversationRoom(newConversation.id);
        }
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      setError(error.message || "Failed to create conversation");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      await chatService.markAsRead(conversationId);

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );

      // Update total unread count
      setUnreadCount((prev) => {
        const conv = conversations.find((c) => c.id === conversationId);
        return prev - (conv?.unreadCount || 0);
      });

      // Emit to socket with message IDs
      if (socket && socket.connected) {
        const messageIds = messages
          .filter((msg) => msg.conversationId === conversationId && !msg.isRead)
          .map((msg) => msg.id);

        if (messageIds.length > 0) {
          socket.emit("mark_as_read", { conversationId, messageIds });
        }
      }
    } catch (error: any) {
      console.error("Error marking as read:", error);
    }
  };

  // Upload file
  const uploadFile = async (file: any): Promise<string> => {
    try {
      const response = await chatService.uploadChatAttachment(file);
      if (response.success) {
        return response.url;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Mark current conversation as read when messages change
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== "user"
      );
      if (unreadMessages.length > 0) {
        markAsRead(currentConversation.id);
      }
    }
  }, [messages, currentConversation]);

  const value: ChatContextType = {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    sendMessage,
    loadMessages,
    isConnected,
    socket,
    loading,
    error,
    unreadCount,
    loadConversations,
    createNewConversation,
    markAsRead,
    uploadFile,
    joinConversationRoom,
    leaveConversationRoom,
    sendTypingIndicator,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
