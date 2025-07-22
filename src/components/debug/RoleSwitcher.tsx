import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";

const RoleSwitcher: React.FC = () => {
  const { user } = useAuth();

  const switchRole = async (newRole: "customer" | "admin" | "shop") => {
    try {
      if (!user) {
        Alert.alert("Error", "No user logged in");
        return;
      }

      const updatedUser = {
        ...user,
        role: newRole,
      };

      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      Alert.alert(
        "Role Changed",
        `Role changed to ${newRole}. Please restart the app to see changes.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Force app reload or navigation
              console.log("Role switched to:", newRole);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error switching role:", error);
      Alert.alert("Error", "Failed to switch role");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug: Role Switcher</Text>
      <Text style={styles.currentRole}>Current Role: {user.role}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.customerButton]}
          onPress={() => switchRole("customer")}
        >
          <Text style={styles.buttonText}>Switch to Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shopButton]}
          onPress={() => switchRole("shop")}
        >
          <Text style={styles.buttonText}>Switch to Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={() => switchRole("admin")}
        >
          <Text style={styles.buttonText}>Switch to Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  currentRole: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  customerButton: {
    backgroundColor: "#10b981",
  },
  shopButton: {
    backgroundColor: "#3b82f6",
  },
  adminButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RoleSwitcher;
