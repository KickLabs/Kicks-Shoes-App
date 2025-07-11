import apiService from "./api";
import { API_ENDPOINTS } from "../constants/api";

class UserService {
  async getProfile() {
    const response = await apiService.get(API_ENDPOINTS.USER_PROFILE);
    console.log("Profile response:", response);
    // The axios interceptor already extracts response.data, so response is the actual data
    // The backend returns { success: true, data: user }, so we need response.data
    return response.data || response;
  }

  async updateProfile(profileData: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    aboutMe?: string;
  }) {
    const response = await apiService.put(
      API_ENDPOINTS.UPDATE_PROFILE,
      profileData
    );
    console.log("Update profile response:", response);
    return response.data || response;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiService.put(API_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data || response;
  }
}

export default new UserService();
