import axios from "axios";
import { Platform } from "react-native";

const backend = "http://192.168.1.19:3000/api";

console.log("[API] Backend URL:", backend);

const instance = axios.create({
  baseURL: backend,
  timeout: 60000, // 60 seconds for mobile networks
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor is handled in api.ts - avoid duplicate interceptors

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    console.log("API Response:", response.status, response.config.url);
    if (response.data) return response.data;
    return response;
  },
  function (error) {
    console.log("API Error:", error.message);
    console.log("Error Config:", error.config?.url);
    console.log(
      "Error Response:",
      error.response?.status,
      error.response?.data
    );
    if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error")
    ) {
      console.log("Network error detected - check connection");
      return Promise.reject(
        new Error("Network error. Please check your internet connection.")
      );
    }
    if (error?.response?.data) return error?.response?.data;
    return Promise.reject(error);
  }
);

export default instance;
