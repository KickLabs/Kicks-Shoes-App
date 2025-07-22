import { API_URL } from "@/constants/api";
import axios from "axios";

/**
 * Network utility functions for debugging and testing API connectivity
 */
export class NetworkUtils {
  /**
   * Test basic connectivity to the API server
   */
  static async testApiConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        message: "API connection successful",
        details: {
          status: response.status,
          url: API_URL,
        },
      };
    } catch (error: any) {
      let errorMessage = "API connection failed";
      if (error.code === "ECONNREFUSED") {
        errorMessage = "Server is not running or unreachable";
      } else if (error.code === "ENOTFOUND") {
        errorMessage = "Server hostname not found";
      } else if (error.code === "ETIMEDOUT") {
        errorMessage = "Connection timeout";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error - check internet connection";
      }

      return {
        success: false,
        message: errorMessage,
        details: {
          code: error.code,
          message: error.message,
          url: API_URL,
        },
      };
    }
  }

  /**
   * Get current network configuration info
   */
  static getNetworkInfo(): { apiUrl: string; timestamp: string } {
    return {
      apiUrl: API_URL,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test if server is reachable with ping-like functionality
   */
  static async pingServer(): Promise<{
    success: boolean;
    responseTime: number;
    message: string;
  }> {
    const startTime = Date.now();

    try {
      await axios.get(`${API_URL}/products`, {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
        message: `Server responded in ${responseTime}ms`,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      return {
        success: false,
        responseTime,
        message: `Server unreachable after ${responseTime}ms: ${error.message}`,
      };
    }
  }
}

/**
 * Helper function to log network debugging information
 */
export const logNetworkInfo = () => {
  const info = NetworkUtils.getNetworkInfo();
};

/**
 * Helper function to run network diagnostics
 */
export const runNetworkDiagnostics = async () => {
  // Test API connection
  const connectionTest = await NetworkUtils.testApiConnection();

  // Ping server
  const pingTest = await NetworkUtils.pingServer();

  return {
    connection: connectionTest,
    ping: pingTest,
  };
};
