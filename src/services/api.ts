import { API_BASE_URL } from "@/constants/config";

interface ApiResponse<T> {
  data: T;
  status: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
    };
  }

  async getExample() {
    // This is a mock response. In a real app, this would be an actual API call
    return {
      message: "Hello from the API!",
    };
  }
}

export const apiService = new ApiService(API_BASE_URL);
