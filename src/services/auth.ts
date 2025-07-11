import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

class AuthService {
  async login(email: string, password: string) {
    const response = await apiService.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    const data = response.data as any;
    console.log("LOGIN RESPONSE:", data);
    // Chấp nhận nhiều kiểu response khác nhau
    const token =
      data.token ||
      data.data?.token ||
      data.accessToken ||
      data.data?.accessToken ||
      data.tokens?.accessToken; // Thêm dòng này!
    console.log("TOKEN LƯU:", token);
    if (token) {
      await AsyncStorage.setItem("accessToken", token);
    }
    return data.data || data; // trả về user info nếu cần
  }

  async register(name: string, email: string, password: string) {
    const response = await apiService.post(API_ENDPOINTS.REGISTER, {
      name,
      email,
      password,
    });
    const data = response.data as any;
    return data.data;
  }

  async logout() {
    await AsyncStorage.removeItem("accessToken");
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (e) {
      // Có thể bỏ qua lỗi này
    }
  }
}

export default new AuthService();
