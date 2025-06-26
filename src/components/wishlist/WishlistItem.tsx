import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { removeFromWishlist } from "../../store/slices/wishlistSlice";
import { addToCart } from "../../store/slices/cartSlice";

interface WishlistItemProps {
  item: {
    id: string;
    name: string;
    summary: string;
    brand: string;
    mainImage: string;
    rating: number;
    isNew: boolean;
    price: {
      regular: number;
      discountPercent: number;
      isOnSale: boolean;
    };
    category: string;
    stock: number;
  };
  onPress: () => void;
}

const { width } = Dimensions.get("window");

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onPress }) => {
  const dispatch = useDispatch();

  const handleRemoveFromWishlist = () => {
    dispatch(removeFromWishlist(item.id));
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price.regular,
        quantity: 1,
        image: item.mainImage,
      })
    );
  };

  const calculateDiscountedPrice = () => {
    if (item.price.isOnSale) {
      return item.price.regular * (1 - item.price.discountPercent / 100);
    }
    return item.price.regular;
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={onPress}>
        <Image source={{ uri: item.mainImage }} style={styles.image} />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
        {item.price.isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>-{item.price.discountPercent}%</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>{item.brand}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveFromWishlist}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.category}>{item.category}</Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${discountedPrice.toFixed(0)}</Text>
          {item.price.isOnSale && (
            <Text style={styles.originalPrice}>${item.price.regular}</Text>
          )}
        </View>

        <View style={styles.stockContainer}>
          <Text
            style={[
              styles.stock,
              item.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}
          >
            {item.stock > 0 ? "In Stock" : "Out of Stock"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            item.stock === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={item.stock === 0}
        >
          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 220,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  newBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  saleBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brand: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  category: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rating: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
  },
  originalPrice: {
    fontSize: 16,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    marginLeft: 10,
    fontWeight: "500",
  },
  stockContainer: {
    marginBottom: 16,
  },
  stock: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inStock: {
    color: "#10B981",
  },
  outOfStock: {
    color: "#EF4444",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E293B",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#1E293B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0.1,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default WishlistItem;
