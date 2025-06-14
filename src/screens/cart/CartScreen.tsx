import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

const CartScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cart Screen</Text>
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

export default CartScreen;
