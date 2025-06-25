import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Slider from "@react-native-community/slider"; // Import slider library

const SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
const CATEGORIES = [
  "Casual shoes",
  "Runners",
  "Hiking",
  "Sneaker",
  "Basketball",
  "Golf",
  "Outdoor"
];
const COLORS = [
  "#3B82F6",
  "#F59E0B",
  "#111827",
  "#065F46",
  "#374151",
  "#F97316",
  "#D1D5DB",
  "#1E3A8A",
  "#92400E",
  "#B45309",
  "white",
  "black"
];
const BRANDS = ["Nike", "Jordan"];

const FilterModal = ({ visible, onClose, onApply }: any) => {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(500); // Một giá trị slider duy nhất

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
      price
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
                  selectedSizes.includes(size) && styles.selected
                ]}
                onPress={() => toggle(size, selectedSizes, setSelectedSizes)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSizes.includes(size) && styles.selectedText
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
                  { backgroundColor: color },
                  selectedColors.includes(color) && styles.selectedBorder
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

          {/* GENDER */}
          <Text style={styles.sectionTitle}>BRAND</Text>
          {BRANDS.map((gen) => (
            <TouchableOpacity
              key={gen}
              onPress={() => toggle(gen, selectedBrands, setSelectedBrands)}
              style={styles.checkboxRow}
            >
              <Text>
                {selectedBrands.includes(gen) ? "☑" : "☐"} {gen}
              </Text>
            </TouchableOpacity>
          ))}

          {/* PRICE RANGE */}
          <Text style={styles.sectionTitle}>PRICE</Text>
          <View style={styles.priceSlider}>
            <Text>${price}</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 10 }}
              minimumValue={0}
              maximumValue={1000}
              step={1}
              value={price}
              onValueChange={(value) => setPrice(value)}
              minimumTrackTintColor="#000"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#000"
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
              setPrice(500); // Reset giá trị slider
            }}
          >
            <Text
              style={{
                textAlign: "center"
              }}
            >
              RESET
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.apply} onPress={handleApply}>
            <Text
              style={{
                color: "white",
                textAlign: "center"
              }}
            >
              APPLY
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8E9E4",
    marginTop: "auto",
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: "600"
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  sizeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    margin: 4,
    minWidth: 40,
    alignItems: "center"
  },
  sizeText: {
    fontSize: 14
  },
  selected: {
    backgroundColor: "#000"
  },
  selectedText: {
    color: "white"
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  colorBox: {
    minWidth: 40,
    height: 40,
    borderRadius: 4,
    margin: 4
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: "#000"
  },
  checkboxRow: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  priceSlider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10
  },
  reset: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    width: "47%"
  },
  apply: {
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 6,
    width: "47%"
  }
});
