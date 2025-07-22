import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";

const NavigationTest: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  const testAdminNavigation = () => {
    try {
      console.log("🧪 Testing AdminDashboard navigation...");
      (navigation as any).navigate("AdminDashboard");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        (error as Error).message || "Unknown error"
      );
    }
  };

  const showUserInfo = () => {
    Alert.alert(
      "User Info",
      `Authenticated: ${isAuthenticated}\nRole: ${user?.role || "None"}\nName: ${user?.name || "None"}`,
      [{ text: "OK" }]
    );
  };

  const testRoleLogic = () => {
    const shouldRedirect = user?.role === "admin" || user?.role === "shop";
    Alert.alert(
      "Role Logic Test",
      `Should redirect to AdminDashboard: ${shouldRedirect}\nCurrent role: ${user?.role}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Navigation Test</Text>

      <TouchableOpacity style={styles.button} onPress={showUserInfo}>
        <Text style={styles.buttonText}>Show User Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testRoleLogic}>
        <Text style={styles.buttonText}>Test Role Logic</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testAdminNavigation}>
        <Text style={styles.buttonText}>Test AdminDashboard Navigation</Text>
      </TouchableOpacity>

      {user && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Current User: {user.name}</Text>
          <Text style={styles.infoText}>Role: {user.role}</Text>
          <Text style={styles.infoText}>
            Authenticated: {isAuthenticated ? "✅" : "❌"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  infoText: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
  },
});

export default NavigationTest;
