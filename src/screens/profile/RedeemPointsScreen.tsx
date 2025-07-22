import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import rewardPointService, {
  RedeemPointsPayload,
  RewardPointStats,
} from "@/services/rewardPoint";

const { width } = Dimensions.get("window");

interface RedemptionOption {
  id: string;
  name: string;
  points: number;
  discount: number;
  description: string;
  ratio: number;
}

const RedeemPointsScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [stats, setStats] = useState<RewardPointStats>({
    availablePoints: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    totalExpired: 0,
  });
  const [selectedOption, setSelectedOption] = useState<RedemptionOption | null>(
    null
  );
  const [customPoints, setCustomPoints] = useState("");
  const [customDiscount, setCustomDiscount] = useState(0);

  const redemptionOptions: RedemptionOption[] = [
    {
      id: "small",
      name: "Small Discount",
      points: 50,
      discount: 50000,
      description: "Perfect for small purchases",
      ratio: 1000,
    },
    {
      id: "medium",
      name: "Medium Discount",
      points: 100,
      discount: 120000,
      description: "Great value for medium orders",
      ratio: 1200,
    },
    {
      id: "large",
      name: "Large Discount",
      points: 200,
      discount: 250000,
      description: "Best value for large orders",
      ratio: 1250,
    },
    {
      id: "premium",
      name: "Premium Discount",
      points: 500,
      discount: 650000,
      description: "Maximum value for premium orders",
      ratio: 1300,
    },
  ];

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const data = await rewardPointService.getUserStats();
      console.log("User reward stats:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      Alert.alert("Error", "Failed to load reward points data");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: RedemptionOption) => {
    if (stats.availablePoints < option.points) {
      Alert.alert(
        "Not Enough Points",
        `You need ${option.points} points for this option`
      );
      return;
    }
    setSelectedOption(option);
    setCustomPoints(option.points.toString());
    setCustomDiscount(option.discount);
  };

  const handleCustomPointsChange = (text: string) => {
    setCustomPoints(text);
    const points = parseInt(text) || 0;

    if (points >= 10) {
      const discount = rewardPointService.calculateDiscountAmount(points);
      setCustomDiscount(discount);
      setSelectedOption(null);
    } else {
      setCustomDiscount(0);
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(customPoints) || 0;

    if (points < 10) {
      Alert.alert("Invalid Amount", "Minimum 10 points required");
      return;
    }

    if (points > stats.availablePoints) {
      Alert.alert(
        "Not Enough Points",
        "You don't have enough points available"
      );
      return;
    }

    Alert.alert(
      "Confirm Redemption",
      `Redeem ${points} points for ${formatCurrency(customDiscount)} discount?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => performRedeem(points, customDiscount),
        },
      ]
    );
  };

  const performRedeem = async (points: number, discountAmount: number) => {
    try {
      setRedeeming(true);

      const payload: RedeemPointsPayload = {
        points,
        discountAmount,
        description: `Redeemed ${points} points for ${formatCurrency(discountAmount)} discount`,
      };

      const response = await rewardPointService.redeemPoints(payload);

      console.log("=== REDEEM RESPONSE DEBUG ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("response.success:", response.success);
      console.log("response.data:", response.data);
      console.log("response.message:", response.message);
      console.log("==============================");

      // Check if response is successful - handle different response structures
      const isSuccess =
        response.success === true ||
        (response.data &&
          response.data.discount &&
          response.data.discount.code);

      if (isSuccess) {
        const discountCode = response.data?.discount?.code || "Unknown";
        Alert.alert(
          "Success!",
          `Points redeemed successfully!\nDiscount code: ${discountCode}\nThis code has been sent to your email.`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        console.log("Response success is false, showing error");
        Alert.alert("Error", response.message || "Failed to redeem points");
      }
    } catch (error: any) {
      console.error("Error redeeming points:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to redeem points";
      Alert.alert("Error", errorMessage);
    } finally {
      setRedeeming(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `đ${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading reward points...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (stats.availablePoints < 10) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Points</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.insufficientContainer}>
          <Ionicons name="gift-outline" size={80} color="#ccc" />
          <Text style={styles.insufficientTitle}>Need More Points</Text>
          <Text style={styles.insufficientText}>
            You need at least 10 points to redeem for discounts. Keep shopping
            to earn more points!
          </Text>
          <Text style={styles.currentPoints}>
            Current Points: {formatNumber(stats.availablePoints)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Points</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Available Points Info */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pointsInfo}
        >
          <View style={styles.pointsHeader}>
            <Ionicons name="gift" size={28} color="#ffffff" />
            <Text style={styles.pointsTitle}>Available Points</Text>
          </View>
          <Text style={styles.pointsAmount}>
            {formatNumber(stats.availablePoints)}
          </Text>
        </LinearGradient>

        {/* Redemption Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Redemption Option</Text>

          <View style={styles.optionsGrid}>
            {redemptionOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption?.id === option.id && styles.optionCardSelected,
                  stats.availablePoints < option.points &&
                    styles.optionCardDisabled,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={stats.availablePoints < option.points}
                activeOpacity={0.85}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons
                    name="diamond"
                    size={24}
                    color={
                      stats.availablePoints < option.points
                        ? "#cbd5e1"
                        : selectedOption?.id === option.id
                          ? "#3b82f6"
                          : "#64748b"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.optionName,
                    stats.availablePoints < option.points &&
                      styles.optionTextDisabled,
                  ]}
                >
                  {option.name}
                </Text>
                <View style={styles.optionBadge}>
                  <Text
                    style={[
                      styles.optionPoints,
                      stats.availablePoints < option.points &&
                        styles.optionTextDisabled,
                    ]}
                  >
                    {option.points} points
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionDiscount,
                    stats.availablePoints < option.points &&
                      styles.optionTextDisabled,
                  ]}
                >
                  {formatCurrency(option.discount)}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    stats.availablePoints < option.points &&
                      styles.optionTextDisabled,
                  ]}
                >
                  {option.description}
                </Text>
                <View style={styles.optionRateContainer}>
                  <Text
                    style={[
                      styles.optionRate,
                      stats.availablePoints < option.points &&
                        styles.optionTextDisabled,
                    ]}
                  >
                    Rate: 1 point = {formatCurrency(option.ratio)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Custom Amount</Text>

          <View style={styles.customSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Points to Redeem</Text>
              <TextInput
                style={[
                  styles.textInput,
                  customPoints &&
                    parseInt(customPoints) >= 10 &&
                    styles.textInputValid,
                ]}
                value={customPoints}
                onChangeText={handleCustomPointsChange}
                placeholder="Enter points (min 10)"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={6}
                selectionColor="#3b82f6"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Discount Amount</Text>
              <Text style={styles.discountDisplay}>
                {formatCurrency(customDiscount)}
              </Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#52c41a" />
            <Text style={styles.infoTitle}>How it works:</Text>
          </View>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              • 10-49 points: 1 point = 1,000 VND
            </Text>
            <Text style={styles.infoItem}>
              • 50-99 points: 1 point = 1,100 VND (10% bonus)
            </Text>
            <Text style={styles.infoItem}>
              • 100-199 points: 1 point = 1,200 VND (20% bonus)
            </Text>
            <Text style={styles.infoItem}>
              • 200-499 points: 1 point = 1,250 VND (25% bonus)
            </Text>
            <Text style={styles.infoItem}>
              • 500+ points: 1 point = 1,300 VND (30% bonus)
            </Text>
          </View>
        </View>

        {/* Redeem Button */}
        <TouchableOpacity
          style={[
            styles.redeemButtonContainer,
            (!customPoints || parseInt(customPoints) < 10 || redeeming) &&
              styles.redeemButtonDisabled,
          ]}
          onPress={handleRedeem}
          disabled={!customPoints || parseInt(customPoints) < 10 || redeeming}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              !customPoints || parseInt(customPoints) < 10 || redeeming
                ? ["#e2e8f0", "#cbd5e1"]
                : ["#3b82f6", "#1d4ed8"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.redeemButton}
          >
            {redeeming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.redeemButtonText,
                  (!customPoints || parseInt(customPoints) < 10 || redeeming) &&
                    styles.redeemButtonTextDisabled,
                ]}
              >
                Redeem Points
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  insufficientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f8fafc",
  },
  insufficientTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#475569",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  insufficientText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: "400",
  },
  currentPoints: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  pointsInfo: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  pointsAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: (width - 52) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  optionCardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  optionCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  optionBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  optionPoints: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10b981",
    textShadowColor: "rgba(16, 185, 129, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionDiscount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ef4444",
    marginBottom: 8,
    textShadowColor: "rgba(239, 68, 68, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "500",
    lineHeight: 16,
  },
  optionRateContainer: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  optionRate: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "600",
    fontStyle: "italic",
  },
  optionTextDisabled: {
    color: "#cbd5e1",
  },
  customSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputValid: {
    borderColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountDisplay: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  infoList: {
    paddingLeft: 20,
  },
  infoItem: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 8,
    fontWeight: "500",
    lineHeight: 20,
  },
  redeemButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  redeemButton: {
    padding: 18,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  redeemButtonDisabled: {
    backgroundColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  redeemButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  redeemButtonTextDisabled: {
    color: "#cbd5e1",
  },
});

export default RedeemPointsScreen;
