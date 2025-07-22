import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../store";
import { loginSuccess } from "../store/slices/authSlice";
import userService from "./user";

class AuthPersistenceService {
  /**
   * Restore auth state from AsyncStorage when app starts
   */
  async restoreAuthState(): Promise<boolean> {
    try {
      console.log("🔄 Restoring auth state...");
      const token = await AsyncStorage.getItem("accessToken");

      console.log("🔑 Token from storage:", token ? "exists" : "null");

      if (!token) {
        console.log("❌ No token found, user not authenticated");
        return false;
      }

      // Verify token is still valid by getting user profile
      const userProfile = await userService.getProfile();

      if (!userProfile) {
        console.log("❌ Token invalid, removing from storage");
        await AsyncStorage.removeItem("accessToken");
        return false;
      }

      // Map user profile to User type
      const user = {
        id: (userProfile as any).id || (userProfile as any)._id || "unknown",
        email: (userProfile as any).email || "unknown",
        name:
          (userProfile as any).name || (userProfile as any).fullName || "User",
        avatar:
          (userProfile as any).avatar || (userProfile as any).profileImage,
        role: (userProfile as any).role || ("user" as const),
      };

      console.log("✅ User authenticated, dispatching to Redux:", user);

      // Dispatch to Redux store
      store.dispatch(loginSuccess({ user, token }));

      return true;
    } catch (error: any) {
      console.log("❌ Error restoring auth state:", error.message);
      // If token is invalid, remove it
      await AsyncStorage.removeItem("accessToken");
      return false;
    }
  }

  /**
   * Clear all auth data
   */
  async clearAuthState(): Promise<void> {
    try {
      console.log("🗑️ Clearing auth state...");
      await AsyncStorage.removeItem("accessToken");
      console.log("✅ Auth state cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing auth state:", error);
    }
  }
}

export default new AuthPersistenceService();
