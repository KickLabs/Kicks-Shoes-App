import ShareButton from "@/components/button/share.button";
import TextBetweenLine from "@/components/button/text.between.line";
import { APP_COLOR } from "@/utils/constant";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10
  },
  welcomeText: {
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center"
  },
  welcomeBtn: {
    flex: 0.2,
    gap: 30
  },
  heading: {
    fontSize: 45,
    fontWeight: "800"
  },
  body: {
    fontSize: 30,
    fontWeight: "700",
    color: APP_COLOR.ORANGE,
    marginVertical: 10
  },
  footer: {
    fontSize: 15,
    color: "white"
  }
});

type WelcomeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Welcome">;
};

const WelcomeScreen: React.FC<WelcomeProps> = ({ navigation }) => {
  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("assets/images/welcome.png")}
    >
      <LinearGradient
        style={{ flex: 1 }}
        colors={["transparent", "#191B2F"]}
        locations={[0.2, 0.8]}
      >
        <View style={styles.container}>
          <View style={styles.welcomeText}>
            <Text style={styles.heading}>WELCOME TO</Text>
            <Text style={styles.body}>KICKS SHOES</Text>
            <Text style={styles.footer}>
              Vietnam's Leading Online Sneaker Marketplace
            </Text>
          </View>
          <View style={styles.welcomeBtn}>
            <TextBetweenLine title="Đăng nhập với" />

            <View>
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

              <View style={{ paddingTop: 30 }}>
                <ShareButton
                  title="Đăng nhập với email"
                  onPress={() => navigation.navigate("Login")}
                  textStyle={{ color: "#fff", paddingVertical: 5 }}
                  btnStyle={{
                    justifyContent: "center",
                    borderRadius: 30,
                    marginHorizontal: 35,
                    paddingVertical: 15,
                    backgroundColor: "#2c2c2c",
                    borderWidth: 1,
                    borderColor: "#505050",
                    width: "82%"
                  }}
                  pressStyle={{ alignSelf: "stretch" }}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "center"
              }}
            >
              <Text style={{ textAlign: "center", color: "white" }}>
                Chưa có tài khoản?
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text
                  style={{ textDecorationLine: "underline", color: "white" }}
                >
                  Đăng ký.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default WelcomeScreen;
