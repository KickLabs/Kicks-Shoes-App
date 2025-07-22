import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import authPersistenceService from "@/services/authPersistence";
import authManager from "@/services/authManager";

const AuthDebugPanel: React.FC = () => {
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkAuthStatus = async () => {
    try {
      await authManager.debugAuth();
      const status = await authManager.getAuthStatus();
      const asyncToken = await AsyncStorage.getItem("accessToken");

      const info = {
        reduxUser: user ? user.name : "null",
        reduxToken: token ? `${token.substring(0, 20)}...` : "null",
        asyncToken: asyncToken ? `${asyncToken.substring(0, 20)}...` : "null",
        authStatus: status,
        loading,
        error,
      };

      setDebugInfo(info);

      Alert.alert("Auth Debug Info", JSON.stringify(info, null, 2), [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to get debug info");
    }
  };

  const checkAsyncStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("accessToken");
      Alert.alert(
        "AsyncStorage Token",
        storedToken
          ? `Token exists: ${storedToken.substring(0, 50)}...`
          : "No token found"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to check AsyncStorage");
    }
  };

  const restoreAuthState = async () => {
    try {
      const success = await authManager.initializeAuth();
      Alert.alert(
        "Auth Restore",
        success
          ? "Auth state restored successfully"
          : "Failed to restore auth state"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to restore auth state");
    }
  };

  const clearAuthData = async () => {
    try {
      await authManager.clearAuthData();
      Alert.alert("Success", "Auth data cleared");
      setDebugInfo(null);
    } catch (error) {
      Alert.alert("Error", "Failed to clear auth data");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bug-outline" size={24} color={COLORS.primary} />
        <Text style={styles.title}>Auth Debug Panel</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redux State</Text>
        <Text style={styles.label}>
          User: {user ? `${user.name} (${user.email})` : "Not logged in"}
        </Text>
        <Text style={styles.label}>
          Token: {token ? `${token.substring(0, 30)}...` : "No token"}
        </Text>
        <Text style={styles.label}>Loading: {loading ? "Yes" : "No"}</Text>
        <Text style={styles.label}>Error: {error || "None"}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkAsyncStorage}>
          <Text style={styles.buttonText}>Check AsyncStorage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={restoreAuthState}>
          <Text style={styles.buttonText}>Restore Auth State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAuthData}
        >
          <Text style={styles.buttonText}>Clear Auth Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: COLORS.black,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.black,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: COLORS.gray,
    fontFamily: "monospace",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default AuthDebugPanel;
