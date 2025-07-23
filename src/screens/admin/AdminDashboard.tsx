import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  SafeAreaView,
  Dimensions,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as adminService from "../../services/adminService";

const { width, height } = Dimensions.get("window");

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  totalConversations: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | { _id: string; name: string };
  status: boolean;
  images: string[];
  image?: string;
  inStock: boolean;
  isPublished: boolean;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  user: string | { _id: string; fullName: string };
  totalPrice: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string; // Already optional
  productCount: number;
  status: boolean; // Đổi từ isActive sang status
}

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    totalConversations: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Move category management state to component level
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUserInfo();

    // Small delay to ensure token is available after navigation
    const timer = setTimeout(() => {
      loadData();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedTab]);

  const loadUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      const token = await AsyncStorage.getItem("accessToken");

      console.log("[AdminDashboard] Debug token check:", {
        hasUserInfo: !!userInfo,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });

      if (userInfo) {
        setCurrentUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (selectedTab) {
        case "dashboard":
          await loadDashboardData();
          break;
        case "users":
          await loadUsers();
          break;
        case "products":
          await loadProducts();
          break;
        case "categories":
          await loadCategories();
          break;
        case "orders":
          await loadOrders();
          break;
        case "analytics":
          await loadAnalytics();
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      console.log("[AdminDashboard] Loading dashboard data...");

      // Load real dashboard stats from API
      const stats = await adminService.getAdminStats();
      setDashboardStats(stats);

      // Load recent orders for dashboard
      await loadOrders();
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      if (error.message.includes("authentication token")) {
        Alert.alert("Authentication Error", "Please login again.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Failed to load dashboard data. Please try again."
        );
      }
    }
  };

  const loadUsers = async () => {
    try {
      console.log("[AdminDashboard] Loading users...");

      // Load real users from API
      const apiUsers = await adminService.getAdminUsers();

      // Map API data to frontend format
      const mappedUsers: User[] = apiUsers.map((user) => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        avatar:
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3b82f6&color=fff`,
        phone: user.phone,
        address: user.address,
      }));

      setUsers(mappedUsers);
      console.log("[AdminDashboard] Users loaded:", mappedUsers.length);
    } catch (error: any) {
      console.error("Error loading users:", error);
      if (error.message.includes("authentication token")) {
        Alert.alert("Authentication Error", "Please login again.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to load users. Please try again.");
      }
    }
  };

  const loadProducts = async () => {
    try {
      console.log("[AdminDashboard] Loading products...");

      // Load real products from API
      const apiProducts = await adminService.getAdminProducts();
      console.log("[AdminDashboard] Raw products data:", apiProducts);

      // Ensure apiProducts is an array
      if (!Array.isArray(apiProducts)) {
        console.error(
          "[AdminDashboard] Products data is not an array:",
          typeof apiProducts,
          apiProducts
        );
        Alert.alert(
          "Error",
          "Invalid products data format received from server."
        );
        setProducts([]);
        return;
      }

      // Map API data to frontend format
      const mappedProducts: Product[] = apiProducts.map((product) => {
        // Handle price (can be object or number)
        let price = 0;
        if (typeof product.price === "object" && product.price.regular) {
          price = product.price.regular;
        } else if (typeof product.price === "number") {
          price = product.price;
        } else if (product.finalPrice) {
          price = product.finalPrice;
        }

        return {
          id: product._id,
          name: product.name || "Unknown Product",
          description: product.description || "",
          price: price,
          quantity: product.stock || product.quantity || 0,
          stock: product.stock || product.quantity || 0,
          category:
            typeof product.category === "string"
              ? product.category
              : product.category?.name || "Unknown",
          status: product.status || product.inStock || false,
          inStock: product.status || product.inStock || false,
          isPublished: product.status || product.isPublished || false,
          images: product.images || [],
          image:
            product.mainImage || (product.images && product.images[0]) || "",
        };
      });

      setProducts(mappedProducts);
      console.log("[AdminDashboard] Products loaded:", mappedProducts.length);
      console.log("[AdminDashboard] First product image data:", {
        mainImage: apiProducts[0]?.mainImage,
        images: apiProducts[0]?.images,
        mappedImage: mappedProducts[0]?.image,
      });
    } catch (error: any) {
      console.error("Error loading products:", error);
      if (error.message.includes("authentication token")) {
        Alert.alert("Authentication Error", "Please login again.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to load products. Please try again.");
      }

      // Fallback to empty array
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      console.log("[AdminDashboard] Loading categories...");

      // Load real categories from API
      const apiCategories = await adminService.getAdminCategories();
      console.log("[AdminDashboard] Raw categories data:", apiCategories);

      // Ensure apiCategories is an array
      if (!Array.isArray(apiCategories)) {
        console.error(
          "[AdminDashboard] Categories data is not an array:",
          typeof apiCategories,
          apiCategories
        );
        Alert.alert(
          "Error",
          "Invalid categories data format received from server."
        );
        setCategories([]);
        return;
      }

      // Map API data to frontend format
      const mappedCategories: Category[] = apiCategories.map((category) => ({
        id: category._id,
        name: category.name || "Unknown Category",
        description: category.description || "",
        productCount: category.productsCount || category.productCount || 0,
        status: category.status || false,
      }));

      setCategories(mappedCategories);
      console.log(
        "[AdminDashboard] Categories loaded:",
        mappedCategories.length
      );
    } catch (error: any) {
      console.error("Error loading categories:", error);
      if (error.message.includes("authentication token")) {
        Alert.alert("Authentication Error", "Please login again.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to load categories. Please try again.");
      }

      // Fallback to empty array
      setCategories([]);
    }
  };

  const loadOrders = async () => {
    try {
      console.log("[AdminDashboard] Loading orders...");

      // Load real orders from API
      const apiOrders = await adminService.getAdminOrders();
      console.log("[AdminDashboard] Raw orders data:", apiOrders);

      // Ensure apiOrders is an array
      if (!Array.isArray(apiOrders)) {
        console.error(
          "[AdminDashboard] Orders data is not an array:",
          typeof apiOrders,
          apiOrders
        );
        Alert.alert(
          "Error",
          "Invalid orders data format received from server."
        );
        setOrders([]);
        return;
      }

      // Map API data to frontend format
      const mappedOrders: Order[] = apiOrders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber || `ORDER-${order._id?.slice(-6)}`,
        user:
          typeof order.user === "string"
            ? order.user
            : order.user?.fullName || "Unknown User",
        totalPrice: order.totalPrice || 0,
        totalAmount: order.totalPrice || 0, // Same as totalPrice
        status: order.status || "pending",
        createdAt: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN"),
      }));

      setOrders(mappedOrders);
      console.log("[AdminDashboard] Orders loaded:", mappedOrders.length);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      if (error.message.includes("authentication token")) {
        Alert.alert("Authentication Error", "Please login again.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to load orders. Please try again.");
      }

      // Fallback to empty array
      setOrders([]);
    }
  };

  const loadAnalytics = async () => {
    // Load analytics data
    await loadDashboardData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cleanup function for logout
  const performLogoutCleanup = async () => {
    try {
      console.log("[AdminDashboard] Starting logout cleanup...");

      // Clear search query
      setSearchQuery("");

      // Reset selected tab
      setSelectedTab("dashboard");

      // Clear any timers or intervals if they exist
      // Note: Add any specific cleanup logic here if needed

      console.log("[AdminDashboard] Logout cleanup completed");
    } catch (error) {
      console.error("Error during logout cleanup:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      `Are you sure you want to logout from ${currentUser?.role === "admin" ? "Admin" : "Shop"} Dashboard?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Show loading state
              setLoading(true);

              console.log("[AdminDashboard] Admin logout initiated");

              // Perform cleanup tasks
              await performLogoutCleanup();

              // Clear all stored data
              await AsyncStorage.multiRemove([
                "accessToken",
                "userInfo",
                "refreshToken",
                "adminSession",
                "lastLoginTime",
              ]);

              // Clear current user state
              setCurrentUser(null);

              // Clear dashboard data
              setDashboardStats({
                totalUsers: 0,
                totalProducts: 0,
                totalOrders: 0,
                totalRevenue: 0,
                totalCategories: 0,
                totalConversations: 0,
              });
              setProducts([]);
              setCategories([]);
              setOrders([]);
              setUsers([]);

              console.log(
                "[AdminDashboard] Admin data cleared, navigating to login"
              );

              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
              });
            } catch (error) {
              console.error("Error during admin logout:", error);
              setLoading(false);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f39c12";
      case "confirmed":
        return "#3498db";
      case "shipping":
        return "#9b59b6";
      case "active":
      case "delivered":
      case "completed":
        return "#27ae60";
      case "cancelled":
      case "inactive":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const adminTabs = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "speedometer-outline" as const,
    },
    { id: "products", title: "Products", icon: "cube-outline" as const },
    { id: "categories", title: "Categories", icon: "grid-outline" as const },
    { id: "users", title: "Users", icon: "people-outline" as const },
    { id: "orders", title: "Orders", icon: "receipt-outline" as const },
    { id: "analytics", title: "Analytics", icon: "analytics-outline" as const },
  ];

  const renderTabButton = (tabId: string, title: string, icon: string) => (
    <TouchableOpacity
      key={tabId}
      style={[
        styles.tabButton,
        selectedTab === tabId && styles.activeTabButton,
      ]}
      onPress={() => setSelectedTab(tabId)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={selectedTab === tabId ? "#ffffff" : "#6b7280"}
      />
      <Text
        style={[styles.tabText, selectedTab === tabId && styles.activeTabText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderDashboard = () => (
    <ScrollView
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>

        {/* Search Form */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, categories, orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6c757d"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1a1a1a"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="cube-outline" size={24} color="#1a1a1a" />
              <Text style={styles.statNumber}>
                {dashboardStats.totalProducts}
              </Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color="#1a1a1a" />
              <Text style={styles.statNumber}>{dashboardStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="receipt-outline" size={24} color="#1a1a1a" />
              <Text style={styles.statNumber}>
                {dashboardStats.totalOrders}
              </Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color="#1a1a1a" />
              <Text style={styles.statNumber}>
                {formatCurrency(dashboardStats.totalRevenue)}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
        )}

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {/* First Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setSelectedTab("products")}
              >
                <Ionicons name="add-circle-outline" size={24} color="#1a1a1a" />
                <Text style={styles.actionText}>Add New Product</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setSelectedTab("categories")}
              >
                <Ionicons name="create-outline" size={24} color="#1a1a1a" />
                <Text style={styles.actionText}>Manage Categories</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setSelectedTab("orders")}
              >
                <Ionicons name="eye-outline" size={24} color="#1a1a1a" />
                <Text style={styles.actionText}>View Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setSelectedTab("analytics")}
              >
                <Ionicons name="analytics-outline" size={24} color="#1a1a1a" />
                <Text style={styles.actionText}>View Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Orders Section */}
        <View style={styles.recentOrdersContainer}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No orders yet</Text>
            </View>
          ) : (
            <View>
              {orders.slice(0, 3).map((order) => (
                <View key={order.id} style={styles.recentOrderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>
                      Order #{order.orderNumber}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.orderTotal}>
                    {formatCurrency(order.totalAmount || order.totalPrice)}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setSelectedTab("orders")}
              >
                <Text style={styles.viewAllText}>View All Orders</Text>
                <Ionicons name="arrow-forward" size={16} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Revenue Analytics */}
        <View style={styles.revenueAnalyticsContainer}>
          <Text style={styles.sectionTitle}>Revenue Analytics</Text>
          <View style={styles.revenueGrid}>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>
                {formatCurrency(dashboardStats.totalRevenue)}
              </Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Avg. Order Value</Text>
              <Text style={styles.revenueValue}>
                {formatCurrency(
                  dashboardStats.totalOrders > 0
                    ? dashboardStats.totalRevenue / dashboardStats.totalOrders
                    : 0
                )}
              </Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Delivered Orders</Text>
              <Text style={styles.revenueValue}>
                {orders.filter((order) => order.status === "delivered").length}
              </Text>
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Pending Orders</Text>
              <Text style={styles.revenueValue}>
                {orders.filter((order) => order.status === "pending").length}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Category management functions
  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.description) {
      Alert.alert("Error", "Name and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
      });
      
      setIsModalVisible(false);
      setNewCategory({ name: "", description: "" });
      Alert.alert("Success", "Category created successfully");
      loadCategories(); // Refresh the list
    } catch (error: any) {
      console.error("[AdminDashboard] Error creating category:", error);
      Alert.alert("Error", error.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.id) {
      return;
    }

    if (!editingCategory.name || !editingCategory.description) {
      Alert.alert("Error", "Name and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[AdminDashboard] Updating category with data:", {
        id: editingCategory.id,
        name: editingCategory.name,
        description: editingCategory.description,
        status: editingCategory.status
      });

      // Cập nhật tất cả thông tin, bao gồm cả trạng thái
      const result = await adminService.updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
        status: editingCategory.status
      });
      
      console.log("[AdminDashboard] Update result:", result);
      
      setIsModalVisible(false);
      setEditingCategory(null);
      Alert.alert("Success", "Category updated successfully");
      loadCategories(); // Refresh the list
    } catch (error: any) {
      console.error("[AdminDashboard] Error updating category:", error);
      Alert.alert("Error", error.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.deleteCategory(selectedCategoryId);
      
      setIsDeleteModalVisible(false);
      setSelectedCategoryId(null);
      Alert.alert("Success", "Category deleted successfully");
      loadCategories(); // Refresh the list
    } catch (error: any) {
      console.error("[AdminDashboard] Error deleting category:", error);
      Alert.alert("Error", error.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      console.log("[AdminDashboard] Toggle status called with:", {
        categoryId,
        currentStatus: currentStatus,
        willChangeTo: !currentStatus
      });
      
      // Nếu currentStatus = true, chúng ta muốn vô hiệu hóa (shouldActivate = false)
      // Nếu currentStatus = false, chúng ta muốn kích hoạt (shouldActivate = true)
      await adminService.toggleCategoryStatus(categoryId, !currentStatus);
      Alert.alert("Success", `Category ${!currentStatus ? "activated" : "deactivated"} successfully`);
      loadCategories(); // Refresh the list
    } catch (error: any) {
      console.error("[AdminDashboard] Error toggling category status:", error);
      Alert.alert("Error", error.message || "Failed to update category status");
    }
  };

  const renderCategoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        setEditingCategory(null);
        setNewCategory({ name: "", description: "" });
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingCategory ? "Edit Category" : "Create New Category"}
          </Text>
          
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Category name"
            value={editingCategory ? editingCategory.name : newCategory.name}
            onChangeText={(text) => 
              editingCategory 
                ? setEditingCategory({...editingCategory, name: text})
                : setNewCategory({...newCategory, name: text})
            }
          />
          
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            placeholder="Category description"
            multiline={true}
            numberOfLines={4}
            value={editingCategory ? editingCategory.description : newCategory.description}
            onChangeText={(text) => 
              editingCategory 
                ? setEditingCategory({...editingCategory, description: text})
                : setNewCategory({...newCategory, description: text})
            }
          />
          
          {editingCategory && (
            <View style={styles.statusToggleContainer}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleButton,
                    editingCategory.status && styles.statusToggleActive,
                  ]}
                  onPress={() => setEditingCategory({...editingCategory, status: true})}
                >
                  <Text style={[
                    styles.statusToggleText,
                    editingCategory.status && styles.statusToggleActiveText,
                  ]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusToggleButton,
                    !editingCategory.status && styles.statusToggleInactive,
                  ]}
                  onPress={() => setEditingCategory({...editingCategory, status: false})}
                >
                  <Text style={[
                    styles.statusToggleText,
                    !editingCategory.status && styles.statusToggleInactiveText,
                  ]}>Inactive</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setIsModalVisible(false);
                setEditingCategory(null);
                setNewCategory({ name: "", description: "" });
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {editingCategory ? "Update" : "Create"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDeleteModalVisible}
      onRequestClose={() => {
        setIsDeleteModalVisible(false);
        setSelectedCategoryId(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Delete</Text>
          <Text style={styles.modalText}>
            Are you sure you want to delete this category? This action cannot be undone.
          </Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setIsDeleteModalVisible(false);
                setSelectedCategoryId(null);
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCategories = () => (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setEditingCategory(null);
            setNewCategory({ name: "", description: "" });
            setIsModalVisible(true);
          }}
        >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6c757d"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1a1a1a"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <FlatList
            data={categories.filter((category) =>
              category.name.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.categoryProductCount}>
                      {item.productCount} products
                    </Text>
                  <TouchableOpacity
                    onPress={() => handleToggleCategoryStatus(item.id, item.status)}
                  >
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: item.status
                            ? "#27ae60"
                            : "#6c757d",
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.status ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionIconButton}
                  onPress={() => {
                    setEditingCategory(item);
                    setIsModalVisible(true);
                  }}
                >
                    <Ionicons name="create" size={20} color="#1a1a1a" />
                  </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionIconButton}
                  onPress={() => {
                    setSelectedCategoryId(item.id);
                    setIsDeleteModalVisible(true);
                  }}
                >
                    <Ionicons name="trash" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

      {renderCategoryModal()}
      {renderDeleteModal()}
      </View>
    );

  const renderUsers = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {user.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>Role: {user.role}</Text>
          </View>
          <View style={styles.userStatus}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: user.isActive ? "#10b981" : "#ef4444" },
              ]}
            >
              <Text style={styles.statusText}>
                {user.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderProducts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6c757d"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1a1a1a"
          style={{ marginVertical: 20 }}
        />
      ) : (
        <FlatList
          data={products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image
                source={{
                  uri:
                    item.image ||
                    item.images[0] ||
                    "https://via.placeholder.com/80x80",
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={styles.productStock}>
                    Stock: {item.quantity || item.stock}
                  </Text>
                </View>
                <View style={styles.productStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: item.inStock ? "#27ae60" : "#6c757d" },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.isPublished
                          ? "#1a1a1a"
                          : "#6c757d",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity style={styles.actionIconButton}>
                  <Ionicons name="create" size={20} color="#1a1a1a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconButton}>
                  <Ionicons name="trash" size={20} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );

  const renderOrders = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.orderUser}>
            Customer:{" "}
            {typeof order.user === "string" ? order.user : order.user.fullName}
          </Text>
          <Text style={styles.orderPrice}>
            Total: {formatCurrency(order.totalPrice)}
          </Text>
          <Text style={styles.orderDate}>Date: {order.createdAt}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (selectedTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "products":
        return renderProducts();
      case "categories":
        return renderCategories();
      case "orders":
        return renderOrders();
      case "analytics":
        return renderDashboard(); // Reuse dashboard for now
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {currentUser?.role === "admin"
              ? "Admin Dashboard"
              : "Shop Dashboard"}
          </Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {currentUser?.fullName || "User"}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        {adminTabs.map((tab) => renderTabButton(tab.id, tab.title, tab.icon))}
      </ScrollView>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#2d3748",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#d1d5db",
  },
  logoutButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    maxHeight: 60,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    minWidth: 100,
  },
  activeTabButton: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsCardLeft: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: (width - 48) / 2 - 6, // Subtract gap space
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  searchContainer: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000", // Black text color
    paddingRight: 40, // Make space for clear button
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 8,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#9ca3af",
  },
  userStatus: {
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: "#9ca3af",
  },
  productStatus: {
    marginLeft: 16,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  orderUser: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recentOrdersContainer: {
    marginBottom: 24,
  },
  recentOrderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  revenueAnalyticsContainer: {
    marginBottom: 24,
  },
  revenueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  revenueCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "48%", // Two columns
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: "#95a5a6",
  },
  // Additional styles for new components
  sectionContainer: {
    display: "flex",
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  productDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    marginLeft: 12,
  },
  actionIconButton: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#f3f4f6",
  },
  categoryInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryProductCount: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  categoryActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    marginLeft: 12,
  },
  userPhone: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userRoleBadge: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    textTransform: "capitalize",
  },
  userActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    marginLeft: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  modalText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  statusToggleContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  statusToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusToggleActive: {
    backgroundColor: '#27ae60',
  },
  statusToggleInactive: {
    backgroundColor: '#dc3545',
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusToggleActiveText: {
    color: '#ffffff',
  },
  statusToggleInactiveText: {
    color: '#ffffff',
  },
});

export default AdminDashboard;
