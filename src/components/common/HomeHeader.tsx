import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

const HomeHeader = ({ title }: { title: string }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: SIZES.h1,
    color: COLORS.white,
    fontWeight: "bold",
  },
});

export default HomeHeader;
