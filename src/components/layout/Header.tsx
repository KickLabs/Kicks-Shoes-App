import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const navigation = useNavigation();

  const handleLogoPress = () => {
    // @ts-ignore
    navigation.navigate("Home", { screen: "HomeMain" });
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
              source={require("../../../assets/images/logo-header.png")}
              style={styles.logo}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={() => {
              // @ts-ignore
              navigation.navigate("Home", { screen: "SearchScreen" });
            }}
          >
            <Ionicons name="search" size={28} color="#232321" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  headerWrapper: {
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 25,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
