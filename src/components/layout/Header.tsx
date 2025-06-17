import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const navigation = useNavigation();

  const handleLogoPress = () => {
    navigation.navigate("Home" as never);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={handleLogoPress}
            style={styles.logoContainer}
          >
            <Image
              source={require("assets/images/logo-header.png")}
              style={styles.logo}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={28} color="#232321" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute", // Đặt header ở vị trí tuyệt đối
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent", // Background trong suốt
    zIndex: 1000, // Đảm bảo header nằm trên tất cả các thành phần khác
  },
  headerWrapper: {
    backgroundColor: "transparent", // Background trong suốt
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Background trắng với độ trong suốt 90%
    borderRadius: 25,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    // Thêm shadow để tạo hiệu ứng nổi
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Shadow cho Android
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    height: 28,
    width: 90,
    resizeMode: "contain",
  },
  searchIcon: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;