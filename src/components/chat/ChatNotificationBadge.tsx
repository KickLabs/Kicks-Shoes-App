import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useChat } from "@/contexts/ChatContext";

interface Props {
  size?: "small" | "medium" | "large";
  color?: string;
}

const ChatNotificationBadge: React.FC<Props> = ({
  size = "medium",
  color = "#ef4444",
}) => {
  const { unreadCount } = useChat();

  if (unreadCount === 0) return null;

  const sizeStyles = {
    small: { minWidth: 16, height: 16, borderRadius: 8 },
    medium: { minWidth: 20, height: 20, borderRadius: 10 },
    large: { minWidth: 24, height: 24, borderRadius: 12 },
  };

  const textSizes = {
    small: 10,
    medium: 12,
    large: 14,
  };

  return (
    <View style={[styles.badge, sizeStyles[size], { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { fontSize: textSizes[size] }]}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ChatNotificationBadge;
