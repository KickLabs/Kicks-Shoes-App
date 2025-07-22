import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/useAuth";

interface RoleBasedRedirectProps {
  children?: React.ReactNode;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      console.log("🔄 RoleBasedRedirect - User role:", user.role);

      // Redirect based on user role
      if (user.role === "admin" || user.role === "shop") {
        console.log("🔄 Redirecting to AdminDashboard");
        (navigation as any).navigate("AdminDashboard");
      } else {
        console.log("🔄 User is customer, staying on current screen");
        // Customer users stay on the current screen
      }
    }
  }, [isAuthenticated, user, navigation]);

  // Show loading while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.text}>Checking authentication...</Text>
      </View>
    );
  }

  // If admin/shop user, show loading while redirecting
  if (user.role === "admin" || user.role === "shop") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.text}>Redirecting to dashboard...</Text>
      </View>
    );
  }

  // For customer users, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default RoleBasedRedirect;
