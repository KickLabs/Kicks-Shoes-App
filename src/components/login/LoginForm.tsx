import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import CustomCheckbox from "./CustomCheckbox";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import authService from "@/services/auth";
import userService from "@/services/user";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/store/slices/authSlice";
import Toast from "react-native-root-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleRegister = () => {
    navigation.navigate("Register" as never);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword" as never);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      dispatch(loginStart());

      // Call login service
      const loginResponse = await authService.login(email, password);

      // Get user profile after successful login
      const userProfile = await userService.getProfile();

      // Extract token from AsyncStorage (it was saved in authService.login)
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const token = await AsyncStorage.getItem("accessToken");

      if (token && userProfile) {
        // Map user profile to User type
        console.log("🔍 LoginForm: Raw userProfile:", userProfile);
        console.log(
          "🔍 LoginForm: userProfile.role:",
          (userProfile as any).role
        );

        const user = {
          id: (userProfile as any).id || (userProfile as any)._id || "unknown",
          email: (userProfile as any).email || email, // fallback to login email
          name:
            (userProfile as any).name ||
            (userProfile as any).fullName ||
            "User",
          avatar:
            (userProfile as any).avatar || (userProfile as any).profileImage,
          role: (userProfile as any).role || ("customer" as const), // Changed default from "user" to "customer"
        };

        console.log("🔍 LoginForm: Mapped user object:", user);

        // Dispatch success action with user and token
        dispatch(
          loginSuccess({
            user: user,
            token: token,
          })
        );

        console.log("✅ LoginForm: Redux dispatch completed", {
          user,
          token: token ? "exists" : "null",
        });

        // Navigate based on user role
        console.log("🚀 LoginForm: Navigation after login", {
          userRole: user.role,
          canGoBack: navigation.canGoBack(),
        });

        // Check user role and navigate accordingly
        if (user.role === "admin" || user.role === "shop") {
          console.log("🚀 LoginForm: Navigating admin/shop to AdminDashboard");
          // Small delay to ensure token is fully saved
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "AdminDashboard" as never }],
            });
          }, 100);
        } else {
          console.log("🚀 LoginForm: Navigating customer to Profile");
          navigation.reset({
            index: 0,
            routes: [{ name: "Profile" as never }],
          });
        }
      } else {
        throw new Error("Login failed - missing token or user data");
      }
    } catch (err: any) {
      dispatch(loginFailure(err?.message || "Login failed"));
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgot}>Forgot your password?</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.checkboxRow}>
        <CustomCheckbox value={keepLoggedIn} onValueChange={setKeepLoggedIn} />
        <Text style={styles.checkboxText}>
          Keep me logged in - applies to all log in options below. More info
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.loginBtn}
        disabled={loading}
      >
        {loading ? (
          <Ionicons
            name="reload"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text style={styles.loginBtnText}>EMAIL LOGIN</Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#fff"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("../../../assets/images/google-logo.png")}
            style={{ width: 22, height: 22, resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <FontAwesome name="apple" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={require("../../../assets/images/facebook-logo.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.terms}>
        By clicking 'Log In' you agree to our website KicksClub Terms &
        Conditions, Kicks Privacy Notice and Terms & Conditions.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 4,
  },
  forgot: {
    color: "#222",
    textDecorationLine: "underline",
    marginBottom: 10,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#222",
    flex: 1,
  },
  loginBtn: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  socialBtn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: "#fff",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  registerText: {
    fontSize: 14,
    color: "#222",
  },
  registerLink: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  terms: {
    fontSize: 12,
    color: "#222",
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default LoginForm;
