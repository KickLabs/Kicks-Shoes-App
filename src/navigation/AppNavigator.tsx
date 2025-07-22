import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootStackParamList } from "../types/navigation";
import { View, Text } from "react-native";

// Import screens - only the essential ones first
import HomeScreen from "../screens/home/HomeScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import CartScreen from "../screens/cart/CartScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import WishlistScreen from "../screens/wishlist/WishlistScreen";
import SearchScreen from "../screens/home/SearchScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import PaymentResultScreen from "../screens/checkout/PaymentResultScreen";
import ListingScreen from "../screens/home/ListingScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import ConversationList from "../screens/chat/ConversationList";
import NewChatScreen from "../screens/chat/NewChatScreen";
import OrderHistory from "../screens/order/OrderHistory";
import OrderDetailsScreen from "../screens/order/OrderDetailsScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import RedeemPointsScreen from "../screens/profile/RedeemPointsScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";

// Create placeholder components for problematic screens
const OrderPending = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Order Pending</Text>
  </View>
);

const OrderDelivered = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Order Delivered</Text>
  </View>
);

const OrderCancelled = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Order Cancelled</Text>
  </View>
);

const PrivacyPolicy = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Privacy Policy</Text>
  </View>
);

const DeleteUserData = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Delete User Data</Text>
  </View>
);

// Import components
import CustomHeader from "../components/layout/CustomHeader";
import Footer from "../components/layout/Footer";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const CartStack = createStackNavigator();
const WishlistStack = createStackNavigator();
const OrderStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProductStack = createStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

const CartStackScreen = () => (
  <CartStack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
    <CartStack.Screen name="CartMain" component={CartScreen} />
  </CartStack.Navigator>
);

const ChatStackScreen = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ConversationList" component={ConversationList} />
    <ChatStack.Screen name="Chat" component={ChatScreen} />
    <ChatStack.Screen name="NewChat" component={NewChatScreen} />
  </ChatStack.Navigator>
);

const WishlistStackScreen = () => (
  <WishlistStack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
    <WishlistStack.Screen name="WishlistMain" component={WishlistScreen} />
  </WishlistStack.Navigator>
);

const OrderStackScreen = () => (
  <OrderStack.Navigator screenOptions={{ headerShown: false }}>
    <OrderStack.Screen name="OrderHistory" component={OrderHistory} />
    <OrderStack.Screen
      name="OrderDetailsScreen"
      component={OrderDetailsScreen}
    />
    <OrderStack.Screen name="OrderPending" component={OrderPending} />
    <OrderStack.Screen name="OrderDelivered" component={OrderDelivered} />
    <OrderStack.Screen name="OrderCancelled" component={OrderCancelled} />
  </OrderStack.Navigator>
);

const ProductStackScreen = () => (
  <ProductStack.Navigator screenOptions={{ headerShown: false }}>
    <ProductStack.Screen name="ListingMain" component={ListingScreen} />
  </ProductStack.Navigator>
);

const ProfileStack = createStackNavigator();

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="RedeemPoints" component={RedeemPointsScreen} />
    <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    <ProfileStack.Screen name="DeleteUserData" component={DeleteUserData} />
  </ProfileStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <Footer {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeStackScreen} />
    <Tab.Screen name="ListingScreen" component={ProductStackScreen} />
    <Tab.Screen name="Cart" component={CartStackScreen} />
    <Tab.Screen name="Wishlist" component={WishlistStackScreen} />
    <Tab.Screen name="OrderHistory" component={OrderStackScreen} />
    <Tab.Screen name="Profile" component={ProfileStackScreen} />
    <Tab.Screen name="Auth" component={AuthStackScreen} />
    <Tab.Screen name="Chat" component={ChatStackScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
