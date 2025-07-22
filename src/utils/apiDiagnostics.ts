import { API_BASE_URL } from "@/constants/config";
import { API_ENDPOINTS } from "@/constants/api";

export interface ApiDiagnosticResult {
  endpoint: string;
  status: "success" | "error";
  message: string;
  responseTime: number;
  data?: any;
}

class ApiDiagnostics {
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem("accessToken");
    } catch (error) {
      return null;
    }
  }

  async testEndpoint(endpoint: string): Promise<ApiDiagnosticResult> {
    const startTime = Date.now();
    const token = await this.getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          endpoint,
          status: "success",
          message: `✅ ${response.status} ${response.statusText}`,
          responseTime,
          data,
        };
      } else {
        const errorText = await response.text();
        return {
          endpoint,
          status: "error",
          message: `❌ ${response.status} ${response.statusText}: ${errorText.substring(0, 100)}`,
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint,
        status: "error",
        message: `❌ Network Error: ${error.message}`,
        responseTime,
      };
    }
  }

  async runProfileStatsDiagnostics(): Promise<ApiDiagnosticResult[]> {
    console.log("🔍 Running Profile Stats API Diagnostics...");
    console.log(`📡 API Base URL: ${API_BASE_URL}`);

    const endpoints = [
      API_ENDPOINTS.USER_PROFILE,
      `${API_ENDPOINTS.MY_ORDERS}?page=1&limit=1`,
      `${API_ENDPOINTS.WISHLIST}?page=1&limit=1`,
      "/feedback?page=1&limit=1",
    ];

    const results: ApiDiagnosticResult[] = [];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing: ${endpoint}`);
      const result = await this.testEndpoint(endpoint);
      console.log(`⏱️  Response time: ${result.responseTime}ms`);
      console.log(`📊 Result: ${result.message}`);

      if (result.data) {
        console.log("📄 Response structure:");
        if (result.data.data?.pagination) {
          console.log(
            `   - Pagination total: ${result.data.data.pagination.total}`
          );
        }
        if (result.data.count !== undefined) {
          console.log(`   - Count: ${result.data.count}`);
        }
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   - Data array length: ${result.data.data.length}`);
        }
      }

      results.push(result);
    }

    console.log("\n📋 Diagnostics Summary:");
    results.forEach((result) => {
      console.log(
        `${result.status === "success" ? "✅" : "❌"} ${result.endpoint} (${result.responseTime}ms)`
      );
    });

    return results;
  }
}

export const apiDiagnostics = new ApiDiagnostics();
export default apiDiagnostics;
