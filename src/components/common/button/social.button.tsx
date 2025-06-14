import { FontAwesome5 } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import ShareButton from "./share.button";
import TextBetweenLine from "./text.between.line";

const styles = StyleSheet.create({
  welcomeBtn: {
    flex: 1,
    gap: 30
  }
});

interface IProps {
  title: string;
}

const SocialButton = (props: IProps) => {
  const { title } = props;
  return (
    <View style={styles.welcomeBtn}>
      <TextBetweenLine title={title} textColor="black" />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 30
        }}
      >
        <ShareButton
          title="faceBook"
          onPress={() => alert("me")}
          textStyle={{ textTransform: "uppercase" }}
          btnStyle={{
            justifyContent: "center",
            borderRadius: 30,
            backgroundColor: "#fff"
          }}
          icons={
            <Image
              source={require("assets/images/facebook-logo.png")}
              style={{ width: 30, height: 30, resizeMode: "contain" }}
            />
          }
        />

        <ShareButton
          title="google"
          onPress={() => alert("me")}
          textStyle={{ textTransform: "uppercase" }}
          btnStyle={{
            justifyContent: "center",
            borderRadius: 30,
            paddingHorizontal: 20,
            backgroundColor: "#fff"
          }}
          icons={
            <Image
              source={require("assets/images/google-logo.png")}
              style={{ width: 30, height: 30, resizeMode: "contain" }}
            />
          }
        />
      </View>
    </View>
  );
};

export default SocialButton;
