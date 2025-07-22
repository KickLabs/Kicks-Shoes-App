import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import autoIPService from "@/services/autoIP";

interface NetworkStatusBannerProps {
  visible?: boolean;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  visible = true,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [ipInfo, setIpInfo] = useState<{
    configuredIP: string | null;
    apiURL: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;

    const checkNetworkStatus = async () => {
      try {
        const result = await autoIPService.manualIPCheck();
        const info = autoIPService.getCurrentIPInfo();

        setIpInfo(info);
        setShowBanner(result.needsUpdate);

        if (result.needsUpdate) {
          console.log("🔔 Network status banner: IP needs update");
        }
      } catch (error) {
        console.error("Error checking network status:", error);
      }
    };

    checkNetworkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);

    return () => clearInterval(interval);
  }, [visible]);

  const handleFixNetwork = () => {
    Alert.alert(
      "Network Configuration",
      "Your IP address may have changed. Please restart the app with:\n\nnpm start\n\nThis will automatically update your network configuration.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy Command",
          onPress: () => {
            // In a real app, you'd copy to clipboard
            console.log("Command to copy: npm start");
          },
        },
      ]
    );
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner || !ipInfo) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.iconContainer}>
        <Ionicons name="wifi-outline" size={20} color={COLORS.white} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Network Update Required</Text>
        <Text style={styles.subtitle}>IP configuration may be outdated</Text>
        <Text style={styles.ipText}>Current: {ipInfo.configuredIP}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.fixButton} onPress={handleFixNetwork}>
          <Text style={styles.fixButtonText}>Fix</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Ionicons name="close" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#ff9800",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 2,
  },
  ipText: {
    color: COLORS.white,
    fontSize: 10,
    opacity: 0.8,
    fontFamily: "monospace",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fixButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  fixButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  dismissButton: {
    padding: 4,
  },
});

export default NetworkStatusBanner;
