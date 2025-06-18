import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootStackParamList } from "../types/navigation";

// Import screens
import ChatScreen from "../screens/chat/ChatScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import CartScreen from "../screens/cart/CartScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import WishlistScreen from "../screens/wishlist/WishlistScreen";
import OrderHistory from "../screens/order/OrderHistory";
import OrderPending from "../screens/order/OrderPending";
import OrderProcessing from "../screens/order/OrderProcessing";
import OrderShipped from "../screens/order/OrderShipped";
import OrderDelivered from "../screens/order/OrderDelivered";
import OrderCancelled from "../screens/order/OrderCancelled";
import OrderRefunded from "../screens/order/OrderRefunded";
import EditProfileScreen from "../screens/profile/EditProfileScreen";

// Import components
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const CartStack = createStackNavigator();
const WishlistStack = createStackNavigator();
const OrderStack = createStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="Profile" component={ProfileScreen} />
    <AuthStack.Screen name="EditProfile" component={EditProfileScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <Footer {...props} />}
    screenOptions={{
      header: () => <Header />, 
    }}
  >
    <Tab.Screen name="Home" component={HomeStackScreen} />
    <Tab.Screen name="Cart" component={CartStackScreen} />
    <Tab.Screen name="Wishlist" component={WishlistStackScreen} />
    <Tab.Screen name="Profile" component={AuthStackScreen} />
  </Tab.Navigator>
);

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ header: () => <Header /> }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const CartStackScreen = () => (
  <CartStack.Navigator screenOptions={{ header: () => <Header /> }}>
    <CartStack.Screen name="Cart" component={CartScreen} />
  </CartStack.Navigator>
);

const ChatStackScreen = () => (
  <CartStack.Navigator screenOptions={{ header: () => <Header /> }}>
    <CartStack.Screen name="Chat" component={ChatScreen} />
  </CartStack.Navigator>
);

const WishlistStackScreen = () => (
  <WishlistStack.Navigator screenOptions={{ header: () => <Header /> }}>
    <WishlistStack.Screen name="Wishlist" component={WishlistScreen} />
  </WishlistStack.Navigator>
);

const OrderStackScreen = () => (
  <OrderStack.Navigator screenOptions={{ header: () => <Header /> }}>
    <OrderStack.Screen name="OrderHistory" component={OrderHistory} />
    <OrderStack.Screen name="OrderPending" component={OrderPending} />
    <OrderStack.Screen name="OrderProcessing" component={OrderProcessing} />
    <OrderStack.Screen name="OrderShipped" component={OrderShipped} />
    <OrderStack.Screen name="OrderDelivered" component={OrderDelivered} />
    <OrderStack.Screen name="OrderCancelled" component={OrderCancelled} />
    <OrderStack.Screen name="OrderRefunded" component={OrderRefunded} />
  </OrderStack.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <Footer {...props} />}
    screenOptions={{ headerShown: false }}
    <Tab.Screen name="Home" component={HomeStackScreen} />
    <Tab.Screen name="Cart" component={CartStackScreen} />
    <Tab.Screen name="Wishlist" component={WishlistStackScreen} />
    <Tab.Screen name="OrderHistory" component={OrderStackScreen} />
    <Tab.Screen name="Profile" component={AuthStackScreen} />
  </Tab.Navigator>
);

    </NavigationContainer>
  );
};

export default AppNavigator;
