import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/layout/Header";
import LoginForm from "../../components/login/LoginForm";
import ClubInfo from "../../components/login/ClubInfo";
import KicksPlusPromo from "../../components/login/KicksPlusPromo";
import Footer from "../../components/layout/Footer";

const LoginScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LoginForm />
        <ClubInfo />
        <KicksPlusPromo />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#F5F5F0", // Xóa hoặc comment dòng này để nền trong suốt
  },
});

export default LoginScreen;
