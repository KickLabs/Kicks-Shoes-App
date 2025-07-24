import axios from "axios";
import { Platform } from "react-native";

const backend = "http://192.168.108.172:3000/api";

console.log("[API] 🚀 Backend URL:", backend);

const instance = axios.create({
  baseURL: backend,
  timeout: 60000, // 60 seconds for mobile networks
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API] 📤❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    console.log("✅ API Response:", response.status, response.config.url);
    // console.log("📋 Response Data:", JSON.stringify(response.data, null, 2));
    if (response.data) return response.data;
    return response;
  },
  function (error) {
    // Enhanced network error detection
    if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error") ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT" ||
      !error.response
    ) {
      return Promise.reject(
        new Error(
          "Network error. Please check your internet connection and server status."
        )
      );
    }

    // Handle HTTP errors properly
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage =
        errorData?.error || errorData?.message || "Unknown error occurred";

      // Create a proper error object with the server message
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.response.status;
      (apiError as any).data = errorData;

      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export default instance;
