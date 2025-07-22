import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useChat } from "@/contexts/ChatContext";
import { Conversation } from "@/services/chat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AuthGuard from "@/components/auth/AuthGuard";

type NavigationProp = any; // Replace with proper navigation type

const ConversationList: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    conversations,
    loadConversations,
    setCurrentConversation,
    loading,
    error,
    unreadCount,
    createNewConversation,
  } = useChat();

  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchAndSetConversations = async () => {
      await loadConversations();
      // Sau khi load, thêm 2 đoạn chat đặc biệt
      const aiConversation = {
        id: "ai",
        subject: "AI Product Consulting",
        status: "active",
        lastMessage: "Hello, I am AI Product Consulting. How can I help you?",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isAI: true,
      };
      const shopConversation = {
        id: "shop",
        subject: "Shop Support",
        status: "active",
        lastMessage: "Welcome! How can we help you?",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isShop: true,
      };
      // Gộp vào conversations nếu chưa có
      setLocalConversations([
        aiConversation,
        shopConversation,
        ...conversations,
      ]);
    };
    fetchAndSetConversations();
  }, []);

  // Thêm state localConversations để render
  const [localConversations, setLocalConversations] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  // Khi bấm vào AI hoặc Shop, chuyển sang ChatScreen với id đặc biệt
  const handleConversationPress = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    if (conversation.id === "ai") {
      navigation.navigate("Chat", { conversationId: "ai" });
    } else if (conversation.id === "shop") {
      navigation.navigate("Chat", { conversationId: "shop" });
    } else {
      navigation.navigate("Chat", { conversationId: conversation.id });
    }
  };

  const handleNewConversation = () => {
    Alert.prompt(
      "New Support Request",
      "What can we help you with?",
      async (text) => {
        if (text && text.trim()) {
          setCreating(true);
          try {
            await createNewConversation(text.trim(), "Support Request");
            // Navigation will be handled by context after conversation is created
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.message || "Failed to create conversation"
            );
          } finally {
            setCreating(false);
          }
        }
      }
    );
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "Just now";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "chatbubble-ellipses";
      case "closed":
        return "checkmark-circle";
      case "pending":
        return "time";
      default:
        return "chatbubble";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "closed":
        return "#6b7280";
      case "pending":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.unreadCount > 0 && styles.unreadConversation,
      ]}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.conversationInfo}>
            <Text style={styles.conversationSubject} numberOfLines={1}>
              {item.subject}
            </Text>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(item.status)}
                size={12}
                color={getStatusColor(item.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.conversationMeta}>
            <Text style={styles.timeText}>
              {item.lastMessageAt ? formatTime(item.lastMessageAt) : ""}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        )}

        {item.adminName && (
          <Text style={styles.adminText}>Assigned to: {item.adminName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a new conversation to get support from our team
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleNewConversation}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Start Conversation</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Support Chat</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handleNewConversation}
            disabled={creating}
            style={styles.newChatButton}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Ionicons name="add" size={24} color="#3b82f6" />
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <FlatList
          data={localConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3b82f6"]}
            />
          }
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  placeholder: {
    width: 24,
  },
  newChatButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    marginLeft: 8,
    color: "#dc2626",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  conversationItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadConversation: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  conversationInfo: {
    flex: 1,
    marginRight: 12,
  },
  conversationSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
  conversationMeta: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  adminText: {
    fontSize: 12,
    color: "#3b82f6",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ConversationList;
