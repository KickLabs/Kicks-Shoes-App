// components/common/CustomCheckbox.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  label?: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
};

const CustomCheckbox: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!value)}
    >
      <View style={[styles.box, value && styles.checkedBox]}>
        {value && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#444",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#444",
  },
  check: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    color: "#222",
    flexShrink: 1,
  },
});

export default CustomCheckbox;
