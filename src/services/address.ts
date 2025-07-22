import { API_BASE_URL } from "@/constants/config";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode: string;
  isDefault: boolean;
  label: string; // "Home", "Work", "Other"
  createdAt: string;
  updatedAt: string;
}

export interface AddressesResponse {
  success: boolean;
  data: Address[];
  count: number;
}

export interface CreateAddressRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode: string;
  label: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  label?: string;
  isDefault?: boolean;
}

class AddressService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem("accessToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  async getUserAddresses(): Promise<AddressesResponse> {
    try {
      const response = await this.makeRequest("/api/addresses");

      return {
        success: response.success,
        data: response.data || [],
        count: response.count || 0,
      };
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      throw error;
    }
  }

  async getAddressById(
    addressId: string
  ): Promise<{ success: boolean; data: Address }> {
    try {
      const response = await this.makeRequest(`/api/addresses/${addressId}`);

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  }

  async createAddress(
    addressData: CreateAddressRequest
  ): Promise<{ success: boolean; data: Address; message: string }> {
    try {
      const response = await this.makeRequest("/api/addresses", {
        method: "POST",
        body: JSON.stringify(addressData),
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Address created successfully",
      };
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  async updateAddress(
    addressId: string,
    addressData: UpdateAddressRequest
  ): Promise<{ success: boolean; data: Address; message: string }> {
    try {
      const response = await this.makeRequest(`/api/addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(addressData),
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Address updated successfully",
      };
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  async deleteAddress(
    addressId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      return {
        success: response.success,
        message: response.message || "Address deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }

  async setDefaultAddress(
    addressId: string
  ): Promise<{ success: boolean; data: Address; message: string }> {
    try {
      const response = await this.makeRequest(
        `/api/addresses/${addressId}/default`,
        {
          method: "PUT",
        }
      );

      return {
        success: response.success,
        data: response.data,
        message: response.message || "Default address updated successfully",
      };
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  }

  async getDefaultAddress(): Promise<{
    success: boolean;
    data: Address | null;
  }> {
    try {
      const response = await this.makeRequest("/api/addresses/default");

      return {
        success: response.success,
        data: response.data || null,
      };
    } catch (error) {
      console.error("Error fetching default address:", error);
      throw error;
    }
  }

  async validateAddress(
    addressData: CreateAddressRequest
  ): Promise<{ success: boolean; isValid: boolean; message: string }> {
    try {
      const response = await this.makeRequest("/api/addresses/validate", {
        method: "POST",
        body: JSON.stringify(addressData),
      });

      return {
        success: response.success,
        isValid: response.isValid,
        message: response.message || "Address validation completed",
      };
    } catch (error) {
      console.error("Error validating address:", error);
      throw error;
    }
  }

  async searchAddresses(
    query: string
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await this.makeRequest(
        `/api/addresses/search?q=${encodeURIComponent(query)}`
      );

      return {
        success: response.success,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error searching addresses:", error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
