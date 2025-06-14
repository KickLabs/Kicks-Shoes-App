import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

const ProductDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Product Details Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: SIZES.h2,
    color: COLORS.black,
  },
});

export default ProductDetailsScreen;
