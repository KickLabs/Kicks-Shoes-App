import { registerRootComponent } from "expo";
import { Provider } from "react-redux";
import { store } from "./store";
import AppNavigator from "./navigation/AppNavigator";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0EC",
  },
});

registerRootComponent(App);
