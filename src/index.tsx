import { registerRootComponent } from "expo";
import { Provider } from "react-redux";
import { store } from "./store";
import AppNavigator from "./navigation/AppNavigator";
import React, { useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet, Text as RNText, TextProps } from "react-native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const customFonts = {
  "Rubik-Regular": require("../assets/fonts/Rubik/static/Rubik-Regular.ttf"),
  "Rubik-Bold": require("../assets/fonts/Rubik/static/Rubik-Bold.ttf"),
  "Rubik-Italic": require("../assets/fonts/Rubik/static/Rubik-Italic.ttf"),
  "Rubik-SemiBold": require("../assets/fonts/Rubik/static/Rubik-SemiBold.ttf"),
  "Rubik-Black": require("../assets/fonts/Rubik/static/Rubik-Black.ttf"),
  "Rubik-Light": require("../assets/fonts/Rubik/static/Rubik-Light.ttf"),
  "Rubik-BoldItalic": require("../assets/fonts/Rubik/static/Rubik-BoldItalic.ttf"),
  "Rubik-SemiBoldItalic": require("../assets/fonts/Rubik/static/Rubik-SemiBoldItalic.ttf"),
  "Rubik-BlackItalic": require("../assets/fonts/Rubik/static/Rubik-BlackItalic.ttf"),
  "Rubik-ExtraBold": require("../assets/fonts/Rubik/static/Rubik-ExtraBold.ttf"),
  "Rubik-ExtraBoldItalic": require("../assets/fonts/Rubik/static/Rubik-ExtraBoldItalic.ttf"),
  "Rubik-Medium": require("../assets/fonts/Rubik/static/Rubik-Medium.ttf"),
  "Rubik-MediumItalic": require("../assets/fonts/Rubik/static/Rubik-MediumItalic.ttf"),
  "Rubik-LightItalic": require("../assets/fonts/Rubik/static/Rubik-LightItalic.ttf"),
};

// GlobalText wrapper
const GlobalText = (props: TextProps) => (
  <RNText {...props} style={[{ fontFamily: "Rubik-Regular" }, props.style]} />
);

// Set default font for all Text components
(RNText as any).defaultProps = {
  ...(RNText as any).defaultProps,
  style: [{ fontFamily: "Rubik-Regular" }],
};

// Export GlobalText for use throughout the app
export { GlobalText };

const App: React.FC = () => {
  const [fontsLoaded] = Font.useFonts(customFonts);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7E7E3",
  },
});

registerRootComponent(App);
