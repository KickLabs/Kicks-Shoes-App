import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../../store";
import { clearWishlist, addToWishlist } from "../../store/slices/wishlistSlice";
import { getWishlistItems } from "../../mockWishlistData";
import WishlistItem from "../../components/wishlist/WishlistItem";

const WishlistScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.wishlist);

  // Initialize wishlist with mock data when component mounts
  useEffect(() => {
    if (items.length === 0) {
      const mockWishlistItems = getWishlistItems();
      mockWishlistItems.forEach((item) => {
        dispatch(addToWishlist(item));
      });
    }
  }, []);

  const handleProductPress = (productId: string) => {
    // @ts-ignore
    navigation.navigate("ProductDetails", { productId });
  };

  const handleClearWishlist = () => {
    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all items from your wishlist?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => dispatch(clearWishlist()),
        },
      ]
    );
  };

  const EmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={72} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding products you love to your wishlist
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => {
          // @ts-ignore
          navigation.navigate("Home");
        }}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.subtitle}>
          {items.length} {items.length === 1 ? "item" : "items"}
        </Text>
      </View>
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearWishlist}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {items.length > 0 ? (
        <>
          {renderHeader()}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <WishlistItem
                item={item}
                onPress={() => handleProductPress(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            bounces={true}
          />
        </>
      ) : (
        <EmptyWishlist />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  clearButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 120, // Extra padding to prevent content from being hidden by tab bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 120, // Extra padding to prevent overlap with tab bar
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 18,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: "500",
  },
  browseButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#1E293B",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default WishlistScreen;
