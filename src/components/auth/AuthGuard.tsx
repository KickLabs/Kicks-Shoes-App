import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showAlert?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = "Login", 
  showAlert = true 
}) => {
  const navigation = useNavigation();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!(user && token);

  useEffect(() => {
    if (!isAuthenticated) {
      if (showAlert) {
        Alert.alert(
          "Login Required",
          "Please login to access this feature.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            {
              text: "Login",
              onPress: () => {
                // Navigate to the auth stack in the Profile tab
                // @ts-ignore
                navigation.navigate("Profile", { screen: "Login" });
              },
            },
          ]
        );
      } else {
        // @ts-ignore
        navigation.navigate("Profile", { screen: "Login" });
      }
      return;
    }
  }, [isAuthenticated, navigation, showAlert]);

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
