import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootState, AppDispatch } from "../../store";
import {
  fetchWishlistItems,
  removeFromWishlistAsync,
  clearWishlistAsync,
  resetPagination,
} from "../../store/slices/wishlistSlice";
import WishlistProductCard from "../../components/wishlist/WishlistProductCard";
import { addToCart } from "../../store/slices/cartSlice";
import AuthGuard from "../../components/auth/AuthGuard";
import { COLORS, SIZES } from "../../constants/theme";

const WishlistScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, pagination, hasMore } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial wishlist data
  const loadWishlist = useCallback(
    async (page = 1, refresh = false) => {
      if (!user?.id) return;

      try {
        if (refresh) {
          setRefreshing(true);
          dispatch(resetPagination());
        }

        await dispatch(
          fetchWishlistItems({
            userId: user.id,
            page,
            limit: 10,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user?.id, dispatch]
  );

  // Load initial data on mount
  useEffect(() => {
    loadWishlist(1, true);
  }, [loadWishlist]);

  const handleRefresh = useCallback(() => {
    loadWishlist(1, true);
  }, [loadWishlist]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      setLoadingMore(true);
      loadWishlist(pagination.page + 1);
    }
  }, [hasMore, loading, loadingMore, pagination.page, loadWishlist]);

  const handleProductPress = (productId: string) => {
    // @ts-ignore
    navigation.navigate("ProductDetails", { productId });
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromWishlistAsync(productId)).unwrap();
      // Refresh the list after removal
      loadWishlist(1, true);
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item from wishlist");
    }
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
          onPress: async () => {
            try {
              await dispatch(clearWishlistAsync()).unwrap();
            } catch (error) {
              console.error("Error clearing wishlist:", error);
              Alert.alert("Error", "Failed to clear wishlist");
            }
          },
        },
      ]
    );
  };

  const EmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={72} color={COLORS.gray} />
      </View>
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding products you love to your wishlist
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => {
          // @ts-ignore
          navigation.navigate("Home", { screen: "HomeMain" });
        }}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.subtitle}>
          {pagination.total} {pagination.total === 1 ? "item" : "items"}
        </Text>
      </View>
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearWishlist}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more items...</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    // Handle potentially nested price object
    const priceInfo =
      item.price?.regular && typeof item.price.regular === "object"
        ? item.price.regular
        : item.price;

    const actualPrice = priceInfo?.regular || 0;
    const isOnSale = priceInfo?.isOnSale || false;
    const discountPercent = priceInfo?.discountPercent || 0;

    return (
      <WishlistProductCard
        image={item.mainImage}
        name={item.name}
        price={actualPrice}
        originalPrice={actualPrice}
        isNew={item.isNew}
        isOnSale={isOnSale}
        discountPercent={discountPercent}
        onPress={() => handleProductPress(item.id)}
        onRemove={() => handleRemoveItem(item.id)}
        onAddToCart={() =>
          dispatch(
            addToCart({
              id: item.id,
              name: item.name,
              price: actualPrice,
              quantity: 1,
              image: item.mainImage,
            })
          )
        }
      />
    );
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        {renderHeader()}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadWishlist(1, true)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && pagination.page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your wishlist...</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.listContainer,
              items.length === 0 && styles.emptyListContainer,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={!loading ? <EmptyWishlist /> : null}
            ListFooterComponent={loadingMore ? renderFooter() : null}
            bounces={true}
          />
        )}
      </View>
    </AuthGuard>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingTop: Platform.OS === "ios" ? 110 : 90,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "400",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 120,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.lightGray,
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
    fontSize: SIZES.h2,
    fontWeight: "800",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: "500",
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginTop: 16,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.error,
    fontSize: SIZES.body4,
    fontWeight: "600",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 10,
    fontSize: SIZES.body4,
    color: COLORS.gray,
    fontWeight: "500",
  },
});

export default WishlistScreen;
