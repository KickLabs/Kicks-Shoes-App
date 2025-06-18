import RegisterForm from "../../components/register/RegisterForm";
import { registerAPI } from "../../services/auth";
import { APP_COLOR } from "../../utils/constant";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import KicksPlusPromo from "@/components/login/KicksPlusPromo";
import ClubInfo from "@/components/login/ClubInfo";

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const res = await registerAPI(name, email, password);
      if (res.data) {
        navigation.navigate("Login" as never);
      } else {
        Toast.show(Array.isArray(res.message) ? res.message[0] : res.message, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1
        });
      }
    } catch (error) {
      console.log("err: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RegisterForm
          onRegister={handleSignUp}
          onNavigateToLogin={() => navigation.navigate("Login" as never)}
        />
        <ClubInfo />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
