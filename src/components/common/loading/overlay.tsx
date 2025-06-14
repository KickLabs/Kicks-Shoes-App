import { ActivityIndicator, StyleSheet, View } from "react-native";

interface IProps {}

const styles = StyleSheet.create({
  laoding: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  }
});

const LoadingOverlay = (props: IProps) => {
  return (
    <View style={styles.laoding}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingOverlay;
