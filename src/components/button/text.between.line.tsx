import { Text, View } from "react-native";

interface IProps {
  title: string;
  textColor?: "white" | "black";
  gachColor?: "#ccc" | "black";
}

const TextBetweenLine = (props: IProps) => {
  const { title, textColor = "white", gachColor = "#ccc" } = props;
  return (
    <View style={{ flexDirection: "row", gap: 15, justifyContent: "center" }}>
      <View
        style={{
          borderBottomColor: gachColor,
          borderBottomWidth: 1,
          paddingHorizontal: 48
        }}
      ></View>
      <Text style={{ color: textColor, position: "relative", top: 7 }}>
        {title}
      </Text>
      <View
        style={{
          borderBottomColor: gachColor,
          borderBottomWidth: 1,
          paddingHorizontal: 48
        }}
      ></View>
    </View>
  );
};

export default TextBetweenLine;
