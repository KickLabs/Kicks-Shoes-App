import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

type BannerProps = {
  title: string;
  subtitle: string;
  image: any;
  tag?: string;
  onShopNow: () => void;
  thumbnails?: any[];
  onThumbnailPress?: (idx: number) => void;
  selectedThumbnail?: number;
};

const Banner = ({
  title,
  subtitle,
  image,
  tag,
  onShopNow,
  thumbnails = [],
  onThumbnailPress,
  selectedThumbnail = 0,
}: BannerProps) => (
  <View style={styles.wrapper}>
    <View style={styles.titleRow}>
      <Text style={styles.titleBlack}>DO IT </Text>
      <Text style={styles.titleBlue}>RIGHT</Text>
    </View>
    <View style={styles.bannerBox}>
      {tag ? (
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.imageOverlay} />
      <View style={styles.infoBox}>
        <Text style={styles.productTitle}>{subtitle.split("\n")[0]}</Text>
        <Text style={styles.productDesc}>{subtitle.split("\n")[1]}</Text>
        <TouchableOpacity style={styles.button} onPress={onShopNow}>
          <Text style={styles.buttonText}>SHOP NOW</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.thumbnailCol}>
        {thumbnails.map((thumb, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onThumbnailPress && onThumbnailPress(idx)}
            style={[
              styles.thumbnailBox,
              selectedThumbnail === idx && styles.selectedThumbnail,
            ]}
          >
            <Image source={thumb} style={styles.thumbnailImg} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.lightGray,
    padding: 0,
    marginBottom: 18,
    borderRadius: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  titleBlack: {
    fontSize: 55,
    color: COLORS.black,
    letterSpacing: 1,
    fontFamily: "Rubik-Bold",
  },
  titleBlue: {
    fontSize: 55,
    color: COLORS.blue,
    letterSpacing: 1,
    fontFamily: "Rubik-Bold",
  },
  bannerBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 28,
    marginHorizontal: 18,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
    minHeight: 320,
    justifyContent: "flex-end",
    ...SHADOWS.medium,
  },
  tagContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: COLORS.black,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 2,
    alignItems: "center",
  },
  tagText: {
    color: COLORS.white,
    fontSize: 14,
    writingDirection: "ltr",
    textAlign: "center",
    fontFamily: "Rubik-Bold",
  },
  image: {
    width: "100%",
    height: 450,
    borderRadius: 28,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 28,
  },
  infoBox: {
    position: "absolute",
    left: 0,
    bottom: 0,
    padding: 24,
    width: "70%",
  },
  productTitle: {
    fontSize: 26,
    color: COLORS.white,
    marginBottom: 4,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontFamily: "Rubik-SemiBold",
  },
  productDesc: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 18,
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontFamily: "Rubik-Regular",
  },
  button: {
    alignSelf: "flex-start",
    marginTop: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    textTransform: "uppercase",
  },
  thumbnailCol: {
    position: "absolute",
    right: 18,
    bottom: 24,
    flexDirection: "column",
    zIndex: 3,
  },
  thumbnailBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedThumbnail: {
    borderColor: COLORS.blue,
    borderWidth: 3,
  },
  thumbnailImg: {
    width: 45,
    height: 44,
    borderRadius: 12,
    resizeMode: "cover",
  },
});

export default Banner;
