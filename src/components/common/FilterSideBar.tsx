import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface FilterSidebarProps {
  categories: string[];
  sizes: number[];
  colors: string[];
  genders: string[];
  onSelect?: (type: string, value: string | number) => void;
}

const FilterSidebar = ({
  categories,
  sizes,
  colors,
  genders,
  onSelect,
}: FilterSidebarProps) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Genders */}
      <Text style={styles.sectionTitle}>Gender</Text>
      <View style={styles.chipContainer}>
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender}
            style={styles.chip}
            onPress={() => onSelect?.("gender", gender)}
          >
            <Text style={styles.chipText}>{gender}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.chipContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.chip}
            onPress={() => onSelect?.("category", category)}
          >
            <Text style={styles.chipText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sizes */}
      <Text style={styles.sectionTitle}>Size</Text>
      <View style={styles.chipContainer}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={styles.chip}
            onPress={() => onSelect?.("size", size)}
          >
            <Text style={styles.chipText}>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Colors */}
      <Text style={styles.sectionTitle}>Color</Text>
      <View style={styles.colorContainer}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onSelect?.("color", color)}
            style={[styles.colorCircle, { backgroundColor: color }]}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#ddd",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default FilterSidebar;
