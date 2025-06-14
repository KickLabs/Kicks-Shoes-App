import api from "./api";
import { ApiResponse } from "../types";

interface LoginResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface RegisterResponse {
  message: string;
  statusCode: number;
}

export const loginAPI = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  return api.post<LoginResponse>("/auth/login", { email, password });
};

export const registerAPI = async (
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<RegisterResponse>> => {
  return api.post<RegisterResponse>("/auth/register", {
    name,
    email,
    password,
  });
};

export const verifyEmailAPI = async (
  token: string
): Promise<ApiResponse<any>> => {
  return api.post<any>("/auth/verify-email", { token });
};

export const forgotPasswordAPI = async (
  email: string
): Promise<ApiResponse<any>> => {
  return api.post<any>("/auth/forgot-password", { email });
};

export const resetPasswordAPI = async (
  token: string,
  password: string
): Promise<ApiResponse<any>> => {
  return api.post<any>("/auth/reset-password", { token, password });
};
