import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/store";
import { logout as logoutAction } from "@/store/slices/authSlice";

class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      const data = response.data as any;

      console.log(
        "🔍 Auth Service - Full Response:",
        JSON.stringify(data, null, 2)
      );

      // Check if login was successful - be more flexible with success detection
      if (data.success === false) {
        throw new Error(data.error || data.message || "Login failed");
      }

      // Extract token from various possible paths based on backend response structure
      const token =
        data.token || // Direct token
        data.accessToken || // Direct accessToken
        data.data?.token || // data.token
        data.data?.accessToken || // data.accessToken
        data.tokens?.accessToken || // tokens.accessToken
        data.data?.tokens?.accessToken; // data.tokens.accessToken

      console.log("🔍 Auth Service - Token extraction paths:");
      console.log("  - data.token:", data.token || "❌");
      console.log("  - data.accessToken:", data.accessToken || "❌");
      console.log("  - data.data?.token:", data.data?.token || "❌");
      console.log(
        "  - data.data?.accessToken:",
        data.data?.accessToken || "❌"
      );
      console.log(
        "  - data.tokens?.accessToken:",
        data.tokens?.accessToken || "❌"
      );
      console.log(
        "  - data.data?.tokens?.accessToken:",
        data.data?.tokens?.accessToken || "❌"
      );
      console.log(
        "🔍 Auth Service - Final token:",
        token ? "✅ Found" : "❌ Not found"
      );

      if (token) {
        await AsyncStorage.setItem("accessToken", token);
      } else {
        throw new Error("No authentication token received from server");
      }

      return data.data || data;
    } catch (error: any) {
      console.error("❌ Auth Service Login Error:", error.message);
      throw error; // Re-throw to be handled by calling code
    }
  }

  async register(userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) {
    const response = await apiService.post(API_ENDPOINTS.REGISTER, userData);
    const data = response.data as any;
    return data.data;
  }

  async forgotPassword(email: string) {
    try {
      const response = await apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email,
      });
      const data = (response.data || response) as any;
      if (!data || typeof data !== "object") {
        throw new Error("No response from server");
      }
      if (data.success === false) {
        throw new Error(
          data.error || data.message || "Failed to send reset email"
        );
      }
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send reset email"
      );
    }
  }

  async logout() {
    try {
      console.log("🔄 Starting logout process...");

      // Clear AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      console.log("✅ Token removed from storage");

      // Clear Redux store
      store.dispatch(logoutAction());
      console.log("✅ Redux state cleared");

      // Call logout endpoint (optional)
      try {
        await apiService.post(API_ENDPOINTS.LOGOUT);
        console.log("✅ Logout API call successful");
      } catch (apiError) {
        console.log("⚠️ Logout API call failed, but continuing...");
      }

      console.log("✅ Logout process completed");
    } catch (e) {
      console.error("❌ Error during logout:", e);
    }
  }
}

export default new AuthService();
