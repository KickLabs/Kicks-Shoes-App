import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

type Props = {
  onPress: () => void;
};

const CheckoutButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button}  onPress={onPress}>
      <Text style={styles.buttonText}>CHECKOUT</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.black,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutButton;