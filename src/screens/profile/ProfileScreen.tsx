import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { loginSuccess } from "@/store/slices/authSlice";
import authService from "@/services/auth";
import userService from "@/services/user";
import profileService from "@/services/profile";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, SHADOWS } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/config";

const ProfileQuickIcon = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.profileIconContainer} onPress={onPress}>
    <View style={styles.profileIconWrapper}>
      <Ionicons name={icon as any} size={24} color={COLORS.blue} />
    </View>
    <Text style={styles.profileIconLabel}>{label}</Text>
  </TouchableOpacity>
);

const ProfileMenuItem = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIcon}>
      <Ionicons name={icon as any} size={24} color={COLORS.gray} />
    </View>
    <Text style={styles.menuItemText}>{label}</Text>
    <Ionicons
      name="chevron-forward-outline"
      size={20}
      color={COLORS.gray}
      style={styles.menuItemChevron}
    />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!(user && token);

  const [hasAsyncToken, setHasAsyncToken] = useState(false);
  const [asyncTokenChecked, setAsyncTokenChecked] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRender, setForceRender] = useState(0);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  useEffect(() => {
    if (user && token) {
      setForceRender((prev) => prev + 1);
    }
  }, [user, token]);

  const handleNavigate = (screen: string) => navigation.navigate(screen);
  const handleLogout = async () => {
    await authService.logout();
    navigation.navigate("Auth", { screen: "Login" });
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;

    setStatsLoading(true);
    try {
      console.log("=== ProfileScreen: Fetching user stats ===");
      console.log("User object:", user);
      console.log("User ID:", user.id);
      console.log("Token:", token ? "Present" : "Missing");

      const stats = await profileService.getUserStats();
      setStats(stats);

      console.log("=== ProfileScreen: Stats loaded successfully ===");
      console.log("Final stats:", stats);
    } catch (error) {
      console.error("ProfileScreen: Error fetching user stats:", error);
      // Keep default values on error
      setStats({
        orders: 0,
        wishlist: 0,
        reviews: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile(user);
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    const checkAsyncToken = async () => {
      try {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const token = await AsyncStorage.getItem("accessToken");
        setHasAsyncToken(!!token);

        if (token && !user) {
          try {
            const userProfile = await userService.getProfile();
            if (userProfile) {
              const userData = {
                id:
                  (userProfile as any).id ||
                  (userProfile as any)._id ||
                  "unknown",
                email: (userProfile as any).email || "unknown",
                name:
                  (userProfile as any).name ||
                  (userProfile as any).fullName ||
                  "User",
                avatar:
                  (userProfile as any).avatar ||
                  (userProfile as any).profileImage,
                role: (userProfile as any).role || ("user" as const),
              };

              dispatch(loginSuccess({ user: userData, token }));
            }
          } catch (error) {
            // Silent fail
          }
        }
      } catch (error) {
        // Silent fail
      } finally {
        setAsyncTokenChecked(true);
      }
    };
    checkAsyncToken();
  }, [user, dispatch]);

  const isActuallyAuthenticated = isAuthenticated || hasAsyncToken;

  useEffect(() => {
    if (!isActuallyAuthenticated) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      if (profile) return;

      setLoading(true);
      setError(null);
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isActuallyAuthenticated, profile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const recheckAuth = async () => {
        try {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          const token = await AsyncStorage.getItem("accessToken");

          if (token && !user) {
            const userProfile = await userService.getProfile();
            if (userProfile) {
              const userData = {
                id:
                  (userProfile as any).id ||
                  (userProfile as any)._id ||
                  "unknown",
                email: (userProfile as any).email || "unknown",
                name:
                  (userProfile as any).name ||
                  (userProfile as any).fullName ||
                  "User",
                avatar:
                  (userProfile as any).avatar ||
                  (userProfile as any).profileImage,
                role: (userProfile as any).role || ("user" as const),
              };

              dispatch(loginSuccess({ user: userData, token }));
            }
          }

          if (token) {
            const data = await userService.getProfile();
            setProfile(data);
            // Refresh stats when screen comes into focus
            if (user?.id) {
              fetchUserStats();
            }
          }
        } catch (err: any) {
          // Silent fail
        }
      };

      recheckAuth();
    });

    return unsubscribe;
  }, [navigation, user, dispatch]);

  useEffect(() => {
    if (!isActuallyAuthenticated && asyncTokenChecked) {
      // Redirect to login screen directly instead of showing welcome screen
      navigation.navigate("Auth", { screen: "Login" });
    }
  }, [isActuallyAuthenticated, asyncTokenChecked, navigation]);

  if (!isActuallyAuthenticated && asyncTokenChecked) {
    return null;
  }

  if (!asyncTokenChecked) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
      key={forceRender}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Image
            source={require("../../../assets/images/Logo.png")}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setProfile(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={styles.container}
        >
          {/* Enhanced Profile Header */}
          <ExpoLinearGradient
            colors={[COLORS.darkGray, COLORS.black]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeaderGradient}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.profileInfo}>
                <View style={styles.profileMainInfo}>
                  <View style={styles.profileAvatarContainer}>
                    <View style={styles.profileAvatar}>
                      {profile?.avatar ? (
                        <Image
                          source={{ uri: profile.avatar }}
                          style={{ width: 72, height: 72, borderRadius: 36 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="person" size={36} color={COLORS.blue} />
                      )}
                    </View>
                  </View>
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileNameWhite}>
                      {profile?.name || user?.name || "User"}
                    </Text>
                    <Text style={styles.profileEmailWhite}>
                      {profile?.email || user?.email || "user@example.com"}
                    </Text>
                    <View style={styles.profileRoleBadge}>
                      <Text style={styles.profileRoleWhite}>
                        {profile?.role || user?.role || "Customer"}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editButtonWhite}
                  onPress={() => handleNavigate("EditProfile")}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.blue}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ExpoLinearGradient>

          {/* Enhanced Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="bag-outline" size={24} color={COLORS.blue} />
              </View>
              <Text style={styles.statNumber}>
                {statsLoading ? "..." : formatNumber(stats.orders)}
              </Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="heart-outline" size={24} color={COLORS.error} />
              </View>
              <Text style={styles.statNumber}>
                {statsLoading ? "..." : formatNumber(stats.wishlist)}
              </Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={COLORS.warning}
                />
              </View>
              <Text style={styles.statNumber}>
                {statsLoading ? "..." : formatNumber(stats.reviews)}
              </Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <ProfileQuickIcon
              icon="heart-outline"
              label="Wishlist"
              onPress={() => handleNavigate("Wishlist")}
            />
            <ProfileQuickIcon
              icon="bag-outline"
              label="Orders"
              onPress={() => handleNavigate("OrderHistory")}
            />
            <ProfileQuickIcon
              icon="gift-outline"
              label="Redeem Points"
              onPress={() => handleNavigate("RedeemPoints")}
            />
            <ProfileQuickIcon
              icon="card-outline"
              label="Payment"
              onPress={() => {}}
            />
          </View>

          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuSection}>
            <ProfileMenuItem
              icon="person-outline"
              label="My Profile"
              onPress={() => handleNavigate("EditProfile")}
            />
            <ProfileMenuItem
              icon="bag-outline"
              label="Order History"
              onPress={() => handleNavigate("OrderHistory")}
            />
            <ProfileMenuItem
              icon="heart-outline"
              label="Wishlist"
              onPress={() => handleNavigate("Wishlist")}
            />
            <ProfileMenuItem
              icon="gift-outline"
              label="Redeem Points"
              onPress={() => handleNavigate("RedeemPoints")}
            />
            <ProfileMenuItem
              icon="card-outline"
              label="Payment Methods"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon="location-outline"
              label="Addresses"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon="chatbubble-ellipses-outline"
              label="Chat"
              onPress={() => handleNavigate("Chat")}
            />
          </View>

          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuSection}>
            <ProfileMenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon="chatbubble-outline"
              label="Contact Us"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon="star-outline"
              label="Rate App"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon="information-circle-outline"
              label="About"
              onPress={() => {}}
            />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  // Profile Screen Styles
  profileHeaderGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: -20,
  },
  profileHeaderContent: {
    marginTop: 20,
  },
  profileAvatarContainer: {
    ...SHADOWS.medium,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 4,
  },
  profileNameWhite: {
    fontSize: SIZES.h3,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileEmailWhite: {
    fontSize: SIZES.body3,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  profileRoleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: SIZES.radius + 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  profileRoleWhite: {
    fontSize: SIZES.body5,
    color: COLORS.white,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  editButtonWhite: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: SIZES.radius + 4,
    ...SHADOWS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  loadingLogo: {
    width: 60,
    height: 60,
    marginBottom: 16,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: SIZES.body3,
    color: COLORS.error,
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: "600",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    ...SHADOWS.medium,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: SIZES.h4,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: SIZES.body5,
    color: COLORS.blue,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  editButton: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 24,
    borderRadius: SIZES.radius + 4,
    ...SHADOWS.light,
  },
  profileIconContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  profileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  profileIconLabel: {
    fontSize: SIZES.body5,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: SIZES.radius + 4,
    overflow: "hidden",
    ...SHADOWS.light,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemIcon: {
    width: 24,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: SIZES.body3,
    color: COLORS.black,
    fontWeight: "500",
  },
  menuItemChevron: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: "700",
    color: COLORS.black,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: SIZES.radius + 4,
    padding: 20,
    ...SHADOWS.light,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.blue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body5,
    color: COLORS.gray,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.black,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: SIZES.radius + 4,
    ...SHADOWS.medium,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;
