import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showAlert?: boolean;
  requiredRole?: "admin" | "shop" | "customer" | null; // null means any authenticated user
  allowedRoles?: string[]; // Alternative: array of allowed roles
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = "Login",
  showAlert = true,
  requiredRole = null,
  allowedRoles = null,
}) => {
  const navigation = useNavigation();
  const { user, token, isAuthenticated } = useAuth();
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  console.log(
    "🛡️ AuthGuard - isAuthenticated:",
    isAuthenticated,
    "user:",
    user,
    "token:",
    token
  );

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!user || !user.role) return false;

    if (requiredRole) {
      return user.role === requiredRole;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }

    // If no role requirement specified, any authenticated user is allowed
    return true;
  };

  // Check if user should be redirected to admin dashboard
  const shouldRedirectToAdmin = () => {
    if (!user || !user.role) return false;
    return user.role === "admin" || user.role === "shop";
  };

  useEffect(() => {
    console.log(
      "🛡️ AuthGuard useEffect - isAuthenticated:",
      isAuthenticated,
      "hasShownAlert:",
      hasShownAlert,
      "isNavigating:",
      isNavigating,
      "userRole:",
      user?.role
    );

    // If user is authenticated but should be on admin dashboard
    if (
      isAuthenticated &&
      shouldRedirectToAdmin() &&
      !requiredRole &&
      !allowedRoles &&
      !isNavigating
    ) {
      console.log(
        "🛡️ AuthGuard - Redirecting to AdminDashboard for role:",
        user?.role
      );
      setIsNavigating(true);
      setTimeout(() => {
        (navigation as any).navigate("AdminDashboard");
        setIsNavigating(false);
      }, 100);
      return;
    }

    // If user is authenticated but doesn't have required role
    if (isAuthenticated && !hasRequiredRole() && !isNavigating) {
      console.log(
        "🛡️ AuthGuard - User doesn't have required role:",
        requiredRole || allowedRoles
      );
      setHasShownAlert(true);
      setIsNavigating(true);

      Alert.alert(
        "Access Denied",
        `You don't have permission to access this feature. Required role: ${requiredRole || allowedRoles?.join(", ")}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Redirect based on user role
              if (shouldRedirectToAdmin()) {
                (navigation as any).navigate("AdminDashboard");
              } else {
                (navigation as any).navigate("Home");
              }
              setIsNavigating(false);
              setHasShownAlert(false);
            },
          },
        ]
      );
      return;
    }

    // If user is not authenticated
    if (!isAuthenticated && !hasShownAlert && !isNavigating) {
      setHasShownAlert(true);
      setIsNavigating(true);

      if (showAlert) {
        Alert.alert("Login Required", "Please login to access this feature.", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              console.log("🛡️ AuthGuard - Cancel pressed, navigating to Home");
              (navigation as any).navigate("Home");
              setIsNavigating(false);
              setHasShownAlert(false);
            },
          },
          {
            text: "Login",
            onPress: () => {
              console.log(
                "🛡️ AuthGuard - Login pressed, navigating to",
                redirectTo
              );
              // Sử dụng reset để chuyển sang Login ở StackNavigator, không còn tabbar
              (navigation as any).reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
              setIsNavigating(false);
              setHasShownAlert(false);
            },
          },
        ]);
      } else {
        console.log("🛡️ AuthGuard - No alert, navigating to", redirectTo);
        (navigation as any).navigate(redirectTo);
        setIsNavigating(false);
        setHasShownAlert(false);
      }
    }
  }, [
    isAuthenticated,
    hasShownAlert,
    isNavigating,
    navigation,
    redirectTo,
    showAlert,
    user,
    requiredRole,
    allowedRoles,
  ]);

  // Reset states when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setHasShownAlert(false);
      setIsNavigating(false);
    }
  }, [isAuthenticated]);

  // If user is authenticated and has required role, show content
  if (isAuthenticated && hasRequiredRole()) {
    console.log("🛡️ AuthGuard - User is authenticated, rendering children");
    return <>{children}</>;
  }

  // If user is authenticated but should be redirected to admin dashboard
  if (
    isAuthenticated &&
    shouldRedirectToAdmin() &&
    !requiredRole &&
    !allowedRoles
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Redirecting to dashboard...</Text>
      </View>
    );
  }

  console.log("🛡️ AuthGuard - User is not authenticated, showing fallback");
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Please login to access this feature</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default AuthGuard;
