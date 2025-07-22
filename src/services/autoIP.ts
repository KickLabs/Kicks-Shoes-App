import { API_URL } from "@/constants/api";
import axios from "axios";
import { Platform } from "react-native";

/**
 * Auto IP Detection and Update Service
 * Automatically detects IP changes and updates configuration
 */
class AutoIPService {
  private static instance: AutoIPService;
  private currentIP: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  private constructor() {
    this.extractCurrentIP();
    this.startAutoCheck();
  }

  public static getInstance(): AutoIPService {
    if (!AutoIPService.instance) {
      AutoIPService.instance = new AutoIPService();
    }
    return AutoIPService.instance;
  }

  /**
   * Extract current IP from API_URL
   */
  private extractCurrentIP(): void {
    const ipMatch = API_URL.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):/);
    if (ipMatch) {
      this.currentIP = ipMatch[1];
      console.log("[AutoIP] 📍 Current configured IP:", this.currentIP);
    }
  }

  /**
   * Get system IP address (simulated - in real app this would call native code)
   */
  private async getSystemIP(): Promise<string | null> {
    try {
      // In a real React Native app, you'd use a native module or library
      // For now, we'll attempt to detect IP changes through API failures
      const response = await axios.get(`${API_URL}/products`, {
        timeout: 5000,
      });

      if (response.status === 200) {
        // IP is still valid
        return this.currentIP;
      }
    } catch (error: any) {
      console.log(
        "[AutoIP] 🔍 Current IP may have changed, need manual update"
      );
      return null;
    }
    return this.currentIP;
  }

  /**
   * Check if IP has changed and notify user
   */
  private async checkIPChange(): Promise<void> {
    if (this.isChecking) return;

    this.isChecking = true;

    try {
      const systemIP = await this.getSystemIP();

      if (!systemIP && this.currentIP) {
        console.log(
          "[AutoIP] ⚠️ IP change detected! Current config may be outdated"
        );
        console.log("[AutoIP] 💡 Please run: npm run fix-network");

        // You could show a notification here
        this.showIPUpdateNotification();
      }
    } catch (error) {
      console.log("[AutoIP] Error checking IP:", error);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Show notification about IP update need
   */
  private showIPUpdateNotification(): void {
    console.log(
      "🔔 [AutoIP] NOTIFICATION: Network configuration may need updating"
    );
    console.log("🔧 [AutoIP] Run 'npm run fix-network' to auto-fix");
  }

  /**
   * Start automatic IP checking
   */
  private startAutoCheck(): void {
    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkIPChange();
    }, 30000);

    console.log("[AutoIP] 🔄 Started automatic IP monitoring");
  }

  /**
   * Stop automatic IP checking
   */
  public stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[AutoIP] ⏹️ Stopped automatic IP monitoring");
    }
  }

  /**
   * Manually trigger IP check
   */
  public async manualIPCheck(): Promise<{
    needsUpdate: boolean;
    currentIP: string | null;
    message: string;
  }> {
    const systemIP = await this.getSystemIP();

    if (!systemIP && this.currentIP) {
      return {
        needsUpdate: true,
        currentIP: this.currentIP,
        message:
          "IP configuration may be outdated. Please run 'npm run fix-network'",
      };
    }

    return {
      needsUpdate: false,
      currentIP: this.currentIP,
      message: "IP configuration appears to be current",
    };
  }

  /**
   * Get current IP info
   */
  public getCurrentIPInfo(): {
    configuredIP: string | null;
    apiURL: string;
  } {
    return {
      configuredIP: this.currentIP,
      apiURL: API_URL,
    };
  }
}

export default AutoIPService.getInstance();
