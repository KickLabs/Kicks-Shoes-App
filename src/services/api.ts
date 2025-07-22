import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_HEADERS, API_TIMEOUT, API_ERROR_MESSAGES } from "../constants/api";
import { ApiResponse } from "../types";
import axiosInstance from "./axios.customize";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axiosInstance;
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        let token = await AsyncStorage.getItem("accessToken");
        if (
          token &&
          typeof token === "string" &&
          token !== "null" &&
          token !== "undefined"
        ) {
          if (!config.headers) {
            config.headers = {} as import("axios").AxiosRequestHeaders;
          }
          config.headers.Authorization = String("Bearer " + token);
        }
        console.log(
          "TOKEN SENT:",
          token,
          "| HEADER:",
          config.headers.Authorization,
          "| TYPE:",
          typeof config.headers.Authorization
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor giữ nguyên
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Handle unauthorized
              break;
            case 403:
              // Handle forbidden
              break;
            case 404:
              // Handle not found
              break;
            default:
              // Handle other errors
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.api.get(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.api.post(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.api.put(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.api.delete(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return new Error(
        error.response.data.message || API_ERROR_MESSAGES.SERVER_ERROR
      );
    } else if (error.request) {
      // The request was made but no response was received
      return new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(error.message || API_ERROR_MESSAGES.SERVER_ERROR);
    }
  }
}

export default ApiService.getInstance();
