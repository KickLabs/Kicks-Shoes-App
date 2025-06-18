import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import {
  FontAwesome5,
  FontAwesome,
  AntDesign,
  Entypo,
} from "@expo/vector-icons"; // hoặc react-native-vector-icons

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.newsletterSection}>
        <View style={styles.newsletterContent}>
          <Text style={styles.newsletterTitle}>Subscribe to our newsletter</Text>
          <Text style={styles.newsletterText}>
            Stay updated with the latest news and exclusive offers!
          </Text>
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#ffffffaa"
              style={styles.input}
            />
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Image
          source={require("../../../assets/images/Logo.png")}
          style={styles.logoAbove}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footerLinks}>
        <View style={styles.linkColumn}>
          <Text style={styles.linkTitle}>About Us</Text>
          <Text style={styles.linkText}>
            We are the biggest hyperstore in the universe. We got you all covered with our exclusive collection and latest drops.
          </Text>
        </View>
        <View style={styles.linkColumn}>
          <Text style={styles.linkTitle}>Categories</Text>
          {["Runner", "Sneakers", "Basketball", "Outdoor", "Golf", "Hiking"].map((cat) => (
            <Text style={styles.linkText} key={cat}>{cat}</Text>
          ))}
        </View>
        <View style={styles.linkColumn}>
          <Text style={styles.linkTitle}>Company</Text>
          {["About", "Contact", "Blogs"].map((link) => (
            <Text style={styles.linkText} key={link}>{link}</Text>
          ))}
        </View>
        <View style={styles.linkColumn}>
          <Text style={styles.linkTitle}>Follow Us</Text>
          <View style={styles.socialIcons}>
            <FontAwesome name="facebook" size={20} color="#fff" style={styles.icon} />
            <FontAwesome name="instagram" size={20} color="#fff" style={styles.icon} />
            <FontAwesome name="twitter" size={20} color="#fff" style={styles.icon} />
            <FontAwesome5 name="tiktok" size={20} color="#fff" style={styles.icon} />
          </View>
        </View>
      </View>

      <View style={styles.footerLogoBelow}>
        <Image
          source={require("../../../assets/images/Logo.png")}
          style={styles.logoBelow}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footerBottom}>
        <Text style={styles.bottomText}>
          © {currentYear} KICKS+. All rights reserved. |{" "}
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    margin: 15,
    borderRadius: 30,
    overflow: "hidden",
  },
  newsletterSection: {
    backgroundColor: "#4361ee",
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  newsletterContent: {
    maxWidth: "60%",
  },
  newsletterTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  newsletterText: {
    color: "#fff",
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#4361ee",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoAbove: {
    width: 120,
    height: 40,
  },
  footerLinks: {
    backgroundColor: "#000",
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  linkColumn: {
    width: "45%",
    marginBottom: 16,
  },
  linkTitle: {
    color: "orange",
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  linkText: {
    color: "#fff",
    marginVertical: 2,
  },
  socialIcons: {
    flexDirection: "row",
    marginTop: 8,
  },
  icon: {
    marginRight: 12,
  },
  footerLogoBelow: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 12,
  },
  logoBelow: {
    width: "90%",
    height: 40,
  },
  footerBottom: {
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    padding: 16,
  },
  bottomText: {
    color: "#1e1e1e",
    fontSize: 13,
  },
  privacyLink: {
    color: "#0077cc",
    textDecorationLine: "underline",
  },
});

export default Footer;
