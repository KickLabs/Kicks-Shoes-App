import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// (Các component ProfileQuickIcon và ProfileMenuItem không thay đổi)
const ProfileQuickIcon = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.profileIconContainer}>
    <Ionicons name={icon as any} size={28} color="#222" />
    <Text style={styles.profileIconLabel}>{label}</Text>
  </View>
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
    <Ionicons name={icon as any} size={24} color="#555" />
    <Text style={styles.menuItemText}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#aaa" />
  </TouchableOpacity>
);
// ---

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  // Thêm navigation vào props
  const handleNavigate = (screen: string) => navigation.navigate(screen);
  const handleLogout = () => console.log("User logged out");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container}>
        {/* === PART 1: HEADER === */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="camera-outline" size={48} color="#bbb" />
          </View>
          <Text style={styles.name}>Tran Phuc Tien</Text>
          {/* Cập nhật onPress để điều hướng */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ====================================================== */}
        {/* === PART 2: QUICK ACCESS ICON ROW (ĐÃ THAY ĐỔI) === */}
        {/* ====================================================== */}
        <View style={styles.iconRow}>
          <ProfileQuickIcon icon="bag-outline" label="Orders" />
          <ProfileQuickIcon icon="chatbubble-outline" label="Chat" />
          <ProfileQuickIcon icon="settings-outline" label="Settings" />
        </View>
        {/* ====================================================== */}

        {/* === PART 3: ADDITIONAL OPTIONS LIST === */}
        <View style={styles.menuContainer}>
          <ProfileMenuItem
            icon="location-outline"
            label="Shipping Addresses"
            onPress={() => console.log("Navigate to Shipping Addresses")} // Tạm thời giữ console.log
          />
          <ProfileMenuItem
            icon="wallet-outline"
            label="Payment Methods"
            onPress={() => console.log("Navigate to Payment Methods")}
          />
          <ProfileMenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => console.log("Navigate to Help")}
          />
        </View>

        {/* === PART 4: LOGOUT BUTTON === */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  editBtn: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 8,
  },
  editBtnText: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  profileIconContainer: {
    alignItems: "center",
    flex: 1,
  },
  profileIconLabel: {
    fontSize: 13,
    color: "#222",
    marginTop: 6,
  },
  menuContainer: {
    marginTop: 12,
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  logoutButtonText: {
    color: "#d9534f",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
