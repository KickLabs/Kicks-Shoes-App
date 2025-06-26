import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

const OrderHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Saving to celebrate</Text>
      <Text style={styles.subtitle}>
        Enjoy up to 60% off thousands of styles during the end of sale. No code
        needed. Join us - sign in or join now.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default OrderHeader;
