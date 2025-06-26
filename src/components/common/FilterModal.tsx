import React, { useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { products } from "../../mockData";

// Utility functions to extract unique values from mock data
const extractUniqueSizes = () => {
  const allSizes = new Set<number>();
  products.forEach((product) => {
    if (product.variants?.sizes) {
      product.variants.sizes.forEach((size) => allSizes.add(size));
    }
  });
  return Array.from(allSizes).sort((a, b) => a - b);
};

const extractUniqueColors = () => {
  const allColors = new Set<string>();
  products.forEach((product) => {
    if (product.variants?.colors) {
      product.variants.colors.forEach((color) => allColors.add(color));
    }
  });
  return Array.from(allColors);
};

const extractUniqueCategories = () => {
  const allCategories = new Set<string>();
  products.forEach((product) => {
    if (product.category && product.category !== "undefined") {
      allCategories.add(product.category);
    }
  });
  return Array.from(allCategories);
};

const extractUniqueBrands = () => {
  const allBrands = new Set<string>();
  products.forEach((product) => {
    if (product.brand) {
      allBrands.add(product.brand);
    }
  });
  return Array.from(allBrands);
};

// Color mapping for display
const getColorHex = (colorName: string) => {
  const colorMap: { [key: string]: string } = {
    Black: "#111827",
    White: "#FFFFFF",
    Grey: "#6B7280",
    Red: "#EF4444",
    Blue: "#3B82F6",
    Green: "#10B981",
    Yellow: "#F59E0B",
    Orange: "#F97316",
    Purple: "#8B5CF6",
    Pink: "#EC4899",
    Brown: "#92400E",
  };
  return colorMap[colorName] || "#6B7280";
};

const FilterModal = ({ visible, onClose, onApply }: any) => {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(500);

  // Extract data from mock data
  const SIZES = extractUniqueSizes();
  const COLORS = extractUniqueColors();
  const CATEGORIES = extractUniqueCategories();
  const BRANDS = extractUniqueBrands();

  const toggle = (item: any, list: any[], setList: any) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleApply = () => {
    onApply({
      sizes: selectedSizes,
      colors: selectedColors,
      categories: selectedCategories,
      brands: selectedBrands,
      price,
    });
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <AntDesign name="close" size={24} onPress={onClose} />
        </View>

        <ScrollView>
          {/* SIZE */}
          <Text style={styles.sectionTitle}>SIZE</Text>
          <View style={styles.grid}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeBox,
                  selectedSizes.includes(size) && styles.selected,
                ]}
                onPress={() => toggle(size, selectedSizes, setSelectedSizes)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSizes.includes(size) && styles.selectedText,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* COLOR */}
          <Text style={styles.sectionTitle}>COLOR</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBox,
                  { backgroundColor: getColorHex(color) },
                  selectedColors.includes(color) && styles.selectedBorder,
                ]}
                onPress={() => toggle(color, selectedColors, setSelectedColors)}
              />
            ))}
          </View>

          {/* CATEGORY */}
          <Text style={styles.sectionTitle}>CATEGORY</Text>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() =>
                toggle(cat, selectedCategories, setSelectedCategories)
              }
              style={styles.checkboxRow}
            >
              <Text>
                {selectedCategories.includes(cat) ? "☑" : "☐"} {cat}
              </Text>
            </TouchableOpacity>
          ))}

          {/* BRAND */}
          <Text style={styles.sectionTitle}>BRAND</Text>
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand}
              onPress={() => toggle(brand, selectedBrands, setSelectedBrands)}
              style={styles.checkboxRow}
            >
              <Text>
                {selectedBrands.includes(brand) ? "☑" : "☐"} {brand}
              </Text>
            </TouchableOpacity>
          ))}

          {/* PRICE RANGE */}
          <Text style={styles.sectionTitle}>PRICE</Text>
          <View style={styles.priceSlider}>
            <Text style={styles.priceText}>${Math.round(price)}</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 16 }}
              minimumValue={0}
              maximumValue={1000}
              step={1}
              value={price}
              onValueChange={(value) => setPrice(value)}
              minimumTrackTintColor="#111827"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#111827"
            />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.reset}
            onPress={() => {
              setSelectedSizes([]);
              setSelectedColors([]);
              setSelectedCategories([]);
              setSelectedBrands([]);
              setPrice(500);
            }}
          >
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.apply} onPress={handleApply}>
            <Text style={styles.applyText}>APPLY</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    height: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#F3F4F6",
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 24,
    marginBottom: 12,
    color: "#374151",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  sizeBox: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    minWidth: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  selected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
    shadowColor: "#111827",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  colorBox: {
    minWidth: 48,
    height: 48,
    borderRadius: 12,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: "#111827",
    shadowColor: "#111827",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  checkboxRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  priceSlider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  reset: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    flex: 1,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resetText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  apply: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#111827",
    borderRadius: 12,
    flex: 1,
    shadowColor: "#111827",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  applyText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
