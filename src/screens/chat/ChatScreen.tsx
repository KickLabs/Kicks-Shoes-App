import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useChat } from "@/contexts/ChatContext";
import { ChatMessage } from "@/services/chat";
import { API_BASE_URL } from "@/constants/config";
import aiChatService from "@/services/aiChatService";

import AuthGuard from "@/components/auth/AuthGuard";

type NavigationProp = any; // Replace with proper navigation type
type RouteProp = any; // Replace with proper route type

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {
    messages: contextMessages,
    sendMessage,
    loadMessages,
    currentConversation,
    setCurrentConversation,
    loading,
    error,
    isConnected,
    conversations,
    setMessages: setContextMessages,
    joinConversationRoom,
    leaveConversationRoom,
    sendTypingIndicator,
  } = useChat();

  // Khai báo useState cho messages nếu chưa có
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = route.params?.conversationId;

  useEffect(() => {
    if (conversationId === "ai") {
      // AI chat: set demo messages
      setCurrentConversation({
        id: "ai",
        subject: "AI Product Consulting",
        status: "active",
        lastMessage: "Hello, I am AI Product Consulting. How can I help you?",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      } as any);

      // Set userId cho aiChatService
      const initAIChat = async () => {
        try {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          const userInfoStr = await AsyncStorage.getItem("userInfo");
          let userId = null;
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo?.id || userInfo?._id;
          }

          if (userId) {
            aiChatService.setUserId(userId);
            console.log("[ChatScreen] Set userId for aiChatService:", userId);
          }

          // Load messages từ AsyncStorage
          const savedMessages = await aiChatService.loadMessages();
          console.log("[ChatScreen] Loaded AI messages:", savedMessages);

          if (savedMessages && savedMessages.length > 0) {
            // Convert format từ AIMessage sang ChatMessage
            const convertedMessages = savedMessages.map(
              (msg: any, index: number) => ({
                id: `ai-${index}`,
                conversationId: "ai",
                senderId: msg.isAI ? "ai" : "user",
                senderType: msg.isAI ? "admin" : "user",
                message: msg.content,
                messageType: "text",
                attachments: [],
                isRead: true,
                createdAt: msg.timestamp || new Date().toISOString(),
                updatedAt: msg.timestamp || new Date().toISOString(),
              })
            );
            setMessages(convertedMessages);
          } else {
            // Nếu không có messages, hiển thị welcome message
            setMessages([
              {
                id: "ai-welcome",
                conversationId: "ai",
                senderId: "ai",
                senderType: "admin",
                message:
                  "Hello, I am AI Product Consulting. How can I help you?",
                messageType: "text",
                attachments: [],
                isRead: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]);
          }
        } catch (error) {
          console.error("[ChatScreen] Error initializing AI chat:", error);
        }
      };

      initAIChat();
    } else if (conversationId === "shop") {
      // Shop chat: tìm conversation đã tồn tại với shop hoặc tạo demo
      const initShopChat = async () => {
        try {
          const shopId = "6845be4f54a7582c1d2109b8";

          // Lấy userId hiện tại để tìm conversation với shop
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          const userInfoStr = await AsyncStorage.getItem("userInfo");
          let userId = null;
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo?.id || userInfo?._id;
          }

          // Tìm conversation đã tồn tại với shop trong danh sách conversations
          const existingShopConversation = conversations?.find((conv) => {
            // Kiểm tra participants array có chứa cả userId và shopId
            const participants = (conv as any).participants || [];
            const hasUser = participants.some((p: any) => {
              const pid = typeof p === "string" ? p : p?._id || p?.id;
              return pid === userId;
            });
            const hasShop = participants.some((p: any) => {
              const pid = typeof p === "string" ? p : p?._id || p?.id;
              return pid === shopId;
            });

            return hasUser && hasShop;
          });

          if (existingShopConversation) {
            console.log(
              "[ChatScreen] Found existing shop conversation:",
              existingShopConversation
            );
            // Đã có conversation với shop, load messages
            setCurrentConversation(existingShopConversation);
            await loadMessages(existingShopConversation.id);
            // Join conversation room for realtime updates
            joinConversationRoom(existingShopConversation.id);
          } else {
            console.log(
              "[ChatScreen] No existing shop conversation found, creating demo"
            );
            // Chưa có conversation, hiển thị demo với welcome message
            setCurrentConversation({
              id: "shop",
              subject: "Shop Support",
              status: "active",
              lastMessage: "Welcome! How can we help you?",
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
            } as any);

            // Clear messages để hiển thị empty state hoặc welcome message
            setContextMessages([]);
          }
        } catch (error) {
          console.error("[ChatScreen] Error initializing shop chat:", error);
          // Fallback to demo state
          setCurrentConversation({
            id: "shop",
            subject: "Shop Support",
            status: "active",
            lastMessage: "Welcome! How can we help you?",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
          } as any);
        }
      };

      // Gọi async function
      initShopChat().catch(console.error);
    } else if (conversationId && currentConversation?.id !== conversationId) {
      // Tìm conversation thật và load messages
      const handleConversationChange = async () => {
        const found = conversations?.find((c) => c.id === conversationId);
        if (found) {
          // Leave previous room
          if (
            currentConversation &&
            currentConversation.id !== "ai" &&
            currentConversation.id !== "shop"
          ) {
            leaveConversationRoom(currentConversation.id);
          }

          setCurrentConversation(found);
          // Join new conversation room
          joinConversationRoom(conversationId);
        }
        await loadMessages(conversationId);
      };
      handleConversationChange().catch(console.error);
    } else if (conversationId && currentConversation?.id === conversationId) {
      const handleSameConversation = async () => {
        await loadMessages(conversationId);
        // Join room if not already joined
        if (conversationId !== "ai" && conversationId !== "shop") {
          joinConversationRoom(conversationId);
        }
      };
      handleSameConversation().catch(console.error);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    console.log("[ChatScreen] Messages state updated:", contextMessages);
  }, [contextMessages]);

  // Quyết định render messages nào: local cho AI, context cho conversation thật
  const displayMessages = conversationId === "ai" ? messages : contextMessages;

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (displayMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [displayMessages]);

  // Handle typing indicators with debounce
  const handleTypingChange = (text: string) => {
    setNewMessage(text);

    // Only send typing indicators for real conversations (not AI/Shop demo)
    if (
      !currentConversation ||
      currentConversation.id === "ai" ||
      currentConversation.id === "shop"
    ) {
      return;
    }

    // Start typing
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(currentConversation.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(currentConversation.id, false);
      }
    }, 2000);

    // Stop typing immediately if text is empty
    if (text.length === 0 && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(currentConversation.id, false);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Stop typing indicator when sending message
    if (
      isTyping &&
      currentConversation &&
      currentConversation.id !== "ai" &&
      currentConversation.id !== "shop"
    ) {
      setIsTyping(false);
      sendTypingIndicator(currentConversation.id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    if (conversationId === "ai") {
      // Chỉ demo AI, không gọi BE
      // Gửi cho AI using aiChatService
      const userMessage = {
        content: messageText,
        sender: "user",
        timestamp: new Date(),
        isAI: false,
      };

      const userChatMessage = {
        id: `ai-user-${Date.now()}`,
        conversationId: "ai",
        senderId: "user",
        senderType: "user" as const,
        message: messageText,
        messageType: "text" as const,
        attachments: [],
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userChatMessage];
      setMessages(updatedMessages);

      // Lưu vào AsyncStorage với format AIMessage
      const aiMessages = updatedMessages.map((msg) => ({
        content: msg.message,
        sender: msg.senderId,
        timestamp: new Date(msg.createdAt),
        isAI: msg.senderType === "admin",
      }));
      aiChatService.saveMessages(aiMessages);

      setStreamingMessage("");

      try {
        await aiChatService.sendMessage(
          messageText,
          // onStream callback
          (chunk: string) => {
            setStreamingMessage((prev) => prev + chunk);
          },
          // onComplete callback
          (finalResponse: string, fullData?: any) => {
            const aiMessage = {
              id: `ai-bot-${Date.now()}`,
              conversationId: "ai",
              senderId: "ai",
              senderType: "admin" as const,
              message: finalResponse,
              messageType: "text" as const,
              attachments: [],
              isRead: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);

            // Lưu vào AsyncStorage
            const finalAIMessages = finalMessages.map((msg) => ({
              content: msg.message,
              sender: msg.senderId,
              timestamp: new Date(msg.createdAt),
              isAI: msg.senderType === "admin",
            }));
            aiChatService.saveMessages(finalAIMessages);

            setStreamingMessage("");
            setSending(false);
          },
          // onError callback
          (error: Error) => {
            const errorMessage = {
              id: `ai-error-${Date.now()}`,
              conversationId: "ai",
              senderId: "ai",
              senderType: "admin" as const,
              message: "AI gặp sự cố, vui lòng thử lại sau.",
              messageType: "text" as const,
              attachments: [],
              isRead: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const errorMessages = [...updatedMessages, errorMessage];
            setMessages(errorMessages);

            // Lưu vào AsyncStorage
            const errorAIMessages = errorMessages.map((msg) => ({
              content: msg.message,
              sender: msg.senderId,
              timestamp: new Date(msg.createdAt),
              isAI: msg.senderType === "admin",
            }));
            aiChatService.saveMessages(errorAIMessages);

            setStreamingMessage("");
            setSending(false);
          }
        );
      } catch (error) {
        console.error("[ChatScreen] Error sending AI message:", error);
        setSending(false);
      }
      return;
    }

    // Tất cả trường hợp khác (kể cả shop) đều gọi API gửi tin nhắn
    try {
      let actualConversationId = conversationId;

      // Nếu là shop demo, cần tạo conversation thật trước
      if (conversationId === "shop") {
        // Gọi API tạo conversation mới
        const token = await (async () => {
          try {
            const AsyncStorage =
              require("@react-native-async-storage/async-storage").default;
            return await AsyncStorage.getItem("accessToken");
          } catch {
            return null;
          }
        })();
        const userId = currentConversation?.userId || null;
        const shopId = "6845be4f54a7582c1d2109b8";
        const res = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            shopId,
          }),
        });
        const data = await res.json();
        if (data && data._id) {
          // Cập nhật currentConversation với ID thật
          const updatedConversation = {
            ...currentConversation,
            id: data._id,
          } as any;
          setCurrentConversation(updatedConversation);
          // Cập nhật actualConversationId để gửi tin nhắn đúng
          actualConversationId = data._id;

          // Cập nhật context currentConversation ngay lập tức
          setCurrentConversation(updatedConversation);
        } else {
          throw new Error("Không thể tạo conversation với shop");
        }
      }

      // Nếu là shop và đã tạo conversation, gọi API trực tiếp với ID thật
      if (conversationId === "shop" && actualConversationId !== "shop") {
        // Gọi API trực tiếp với conversation ID thật
        const token = await (async () => {
          try {
            const AsyncStorage =
              require("@react-native-async-storage/async-storage").default;
            return await AsyncStorage.getItem("accessToken");
          } catch {
            return null;
          }
        })();

        const messageResponse = await fetch(
          `${API_BASE_URL}/api/chat/conversations/${actualConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: messageText,
            }),
          }
        );

        if (!messageResponse.ok) {
          const errorText = await messageResponse.text();
          throw new Error(`Failed to send message: ${errorText}`);
        }

        const messageResult = await messageResponse.json();
        console.log("[ChatScreen] Message sent successfully:", messageResult);

        // Thêm tin nhắn vào UI manually (optimistic update)
        // Map response từ BE đúng format
        let newMessage;
        if (messageResult.success && messageResult.data) {
          const rawMessage = messageResult.data;
          newMessage = {
            id: rawMessage._id,
            conversationId: rawMessage.conversationId,
            senderId: rawMessage.sender,
            senderType: "user" as const,
            message: rawMessage.content,
            messageType: "text" as const,
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
          };
        } else {
          // Fallback nếu không có data từ BE
          newMessage = {
            id: `temp-${Date.now()}`,
            conversationId: actualConversationId,
            senderId: "user",
            senderType: "user" as const,
            message: messageText,
            messageType: "text" as const,
            attachments: [],
            isRead: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        console.log("[ChatScreen] Adding new message to context:", newMessage);
        // Thêm vào contextMessages
        setContextMessages((prev) => [...prev, newMessage]);

        // Nếu đây là tin nhắn đầu tiên của shop conversation, load messages cũ
        if (contextMessages.length === 0) {
          console.log(
            "[ChatScreen] Loading existing messages for new shop conversation"
          );
          await loadMessages(actualConversationId);
        }
      } else {
        // Dùng sendMessage từ context cho các trường hợp khác
        await sendMessage(messageText);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Handle clear chat cho AI
  const handleClearChat = async () => {
    if (conversationId === "ai") {
      try {
        // Xóa từ AsyncStorage
        await aiChatService.clearMessages();
        await aiChatService.resetConversation();

        // Reset messages về welcome message
        setMessages([
          {
            id: "ai-welcome",
            conversationId: "ai",
            senderId: "ai",
            senderType: "admin",
            message: "Hello, I am AI Product Consulting. How can I help you?",
            messageType: "text",
            attachments: [],
            isRead: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

        console.log("[ChatScreen] AI chat cleared");
      } catch (error) {
        console.error("[ChatScreen] Error clearing AI chat:", error);
      }
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} days ago`;

      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isUser = item.senderType === "user";
    const prevMessage = index > 0 ? displayMessages[index - 1] : null;
    const showTime =
      !prevMessage ||
      new Date(item.createdAt).getTime() -
        new Date(prevMessage.createdAt).getTime() >
        300000; // 5 minutes

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <Text style={styles.timeStamp}>{formatDate(item.createdAt)}</Text>
        )}
        <View
          style={[
            styles.messageItem,
            isUser ? styles.userMessage : styles.adminMessage,
          ]}
        >
          {!isUser && (
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=Support&background=3b82f6&color=fff",
              }}
              style={styles.avatar}
            />
          )}
          <View
            style={[
              styles.messageContent,
              isUser ? styles.userMessageContent : styles.adminMessageContent,
            ]}
          >
            {!isUser && (
              <Text style={styles.senderName}>
                {item.senderType === "admin" ? "Support Team" : "System"}
              </Text>
            )}
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.adminMessageText,
              ]}
            >
              {item.message}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatTime(item.createdAt)}
              </Text>
              {isUser && (
                <Ionicons
                  name={item.isRead ? "checkmark-done" : "checkmark"}
                  size={16}
                  color={item.isRead ? "#10b981" : "#6b7280"}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {conversationId === "shop" ? (
        <>
          <Ionicons name="storefront-outline" size={64} color="#3b82f6" />
          <Text style={styles.emptyTitle}>Welcome to Shop Support!</Text>
          <Text style={styles.emptySubtitle}>
            Hi there! We're here to help you with any questions about our
            products, orders, or services. How can we assist you today?
          </Text>
        </>
      ) : conversationId === "ai" ? (
        <>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={64}
            color="#10b981"
          />
          <Text style={styles.emptyTitle}>AI Product Consulting</Text>
          <Text style={styles.emptySubtitle}>
            Hello! I'm your AI shopping assistant. I can help you find the
            perfect shoes, compare products, and answer questions about sizing,
            brands, and styles.
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Start the conversation</Text>
          <Text style={styles.emptySubtitle}>
            Send a message to begin chatting with our support team
          </Text>
        </>
      )}
    </View>
  );

  const renderConnectionStatus = () => {
    if (isConnected) return null;

    return <></>;
  };

  if (
    loading &&
    displayMessages.length === 0 &&
    conversationId !== "ai" &&
    conversationId !== "shop"
  ) {
    return (
      <AuthGuard>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support Chat</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        </SafeAreaView>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {currentConversation?.subject || "Support Chat"}
            </Text>
            {currentConversation?.status && (
              <Text style={styles.headerSubtitle}>
                Status: {currentConversation.status.toUpperCase()}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("ConversationList")}
            style={styles.menuButton}
          >
            <Ionicons name="list" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {renderConnectionStatus()}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContainer}
        >
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              displayMessages.length === 0
                ? styles.emptyList
                : styles.messagesList
            }
            showsVerticalScrollIndicator={false}
            inverted={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />

          {/* Streaming message display khi AI đang trả lời */}
          {streamingMessage && conversationId === "ai" && (
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 20,
                marginHorizontal: 20,
                alignItems: "flex-end",
                maxWidth: "85%",
                alignSelf: "flex-start",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <Image
                  source={{
                    uri: "https://res.cloudinary.com/dumuhtrwr/image/upload/v1752928150/kicks-shoes/avatars/file_pdkyiy.png",
                  }}
                  style={[styles.avatar]}
                  onError={(e) => {
                    if (e && e.target) {
                      (e.target as any).style.display = "none";
                    }
                  }}
                />
                <View
                  style={[styles.messageContent, styles.adminMessageContent]}
                >
                  <Text style={[styles.senderName]}>AI Product Consulting</Text>
                  <View>
                    <Text style={[styles.adminMessageText]}>
                      {streamingMessage}
                    </Text>
                    <Text style={{ color: "#4299e1", fontSize: 16 }}>▋</Text>
                  </View>
                  <View style={styles.messageFooter}>
                    <Text style={[styles.messageTime, { color: "#718096" }]}>
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={newMessage}
              onChangeText={handleTypingChange}
              onSubmitEditing={handleSendMessage}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e1e5e9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#718096",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  placeholder: {
    width: 40,
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff3cd",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ffeaa7",
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fbb6ce",
  },
  errorText: {
    marginLeft: 8,
    color: "#c53030",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#718096",
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyList: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 20,
  },
  timeStamp: {
    textAlign: "center",
    fontSize: 11,
    color: "#a0aec0",
    marginBottom: 12,
    fontStyle: "italic",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  userMessage: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
    alignSelf: "flex-end",
  },
  adminMessage: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  messageContent: {
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageContent: {
    backgroundColor: "#4299e1",
    borderBottomRightRadius: 6,
  },
  adminMessageContent: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  userMessageText: {
    color: "#fff",
  },
  adminMessageText: {
    color: "#2d3748",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: "#f7fafc",
    color: "#2d3748",
  },
  sendButton: {
    backgroundColor: "#4299e1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f7fa",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d3748",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    maxWidth: 280,
  },
});

export default ChatScreen;
