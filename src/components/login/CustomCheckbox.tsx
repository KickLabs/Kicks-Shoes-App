import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <TouchableOpacity
      style={styles.box}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      {value && <Ionicons name="checkmark" size={18} color="#222" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#aaa",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});

export default CustomCheckbox;
