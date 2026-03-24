import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");

export default function Hero() {
  return (
    <View style={styles.container}>
      {/* Background Orbs */}
      <View
        style={[
          styles.orb,
          {
            top: -100,
            right: -100,
            backgroundColor: "hsl(345, 60%, 20%)",
            width: 400,
            height: 400,
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          {
            bottom: -50,
            left: -100,
            backgroundColor: "hsl(220, 50%, 15%)",
            width: 300,
            height: 300,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Eyebrow */}
        <Animated.View
          entering={FadeInLeft.delay(200).duration(800)}
          style={styles.eyebrowContainer}
        >
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrowText}>OUR PRIVATE WORLD</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInLeft.delay(400).duration(800)}>
          <Text style={styles.headlineThin}>Every</Text>
          <Text style={styles.headlineItalic}>Chapter</Text>
          <Text style={styles.headlineThin}>of Us</Text>
        </Animated.View>

        {/* Subtext */}
        <Animated.View entering={FadeIn.delay(600).duration(1000)}>
          <Text style={styles.subtext}>
            A living archive of whispers, wanders, and the way we grew —
            preserved in our private corner of forever.
          </Text>
        </Animated.View>

        {/* Photo Section (Mobile Optimized) */}
        <Animated.View
          entering={FadeInRight.delay(800).duration(1000)}
          style={styles.photoSection}
        >
          <View style={styles.photoFrame}>
            <Image
              source={require("../assets/images/hero-main.jpg")}
              style={styles.heroImage}
              contentFit="cover"
              transition={1000}
            />
            <LinearGradient
              colors={["transparent", "rgba(23, 27, 34, 0.6)"]}
              style={styles.imageOverlay}
            />

            {/* Floating Heart */}
            <View style={styles.floatingHeart}>
              <Heart
                size={16}
                fill="hsl(345, 60%, 72%)"
                color="hsl(345, 60%, 72%)"
              />
            </View>
          </View>

          {/* Frame Background Decorations */}
          <View
            style={[
              styles.frameDecor,
              {
                transform: [
                  { rotate: "6deg" },
                  { translateX: 10 },
                  { translateY: 10 },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          entering={FadeInLeft.delay(1000).duration(800)}
          style={styles.ctaContainer}
        >
          <Link href="/(tabs)/timeline" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Our Chapters</Text>
            </Pressable>
          </Link>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              Linking.openURL("https://photos.app.goo.gl/As7BvFsbwdd1QTa86")
            }
          >
            <Text style={styles.secondaryButtonText}>The Gallery</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 700,
    backgroundColor: "hsl(220, 15%, 8%)",
    paddingTop: 40,
    paddingBottom: 60,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.3,
  },
  content: {
    paddingHorizontal: 24,
    gap: 30,
  },
  eyebrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eyebrowLine: {
    width: 40,
    height: 1,
    backgroundColor: "hsl(345, 60%, 72%)",
  },
  eyebrowText: {
    fontSize: 10,
    letterSpacing: 4,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
  },
  headlineThin: {
    fontSize: 64,
    lineHeight: 64,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "CormorantGaramond-Light",
  },
  headlineItalic: {
    fontSize: 72,
    lineHeight: 72,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "CormorantGaramond-Italic",
    marginTop: -10,
    marginBottom: -10,
  },
  subtext: {
    fontSize: 15,
    lineHeight: 24,
    color: "hsl(35, 10%, 50%)",
    fontFamily: "Inter-Light",
    maxWidth: "90%",
  },
  photoSection: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 400,
  },
  photoFrame: {
    width: width * 0.75,
    height: 380,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 2,
    elevation: 10,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  frameDecor: {
    position: "absolute",
    width: width * 0.75,
    height: 380,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(235, 133, 159, 0.2)",
    zIndex: 1,
  },
  floatingHeart: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(235, 133, 159, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(235, 133, 159, 0.3)",
  },
  ctaContainer: {
    flexDirection: "column",
    gap: 15,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "hsl(345, 60%, 72%)",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "hsl(220, 15%, 8%)",
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: "700",
    fontFamily: "Inter-Regular",
    textTransform: "uppercase",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "hsl(35, 10%, 55%)",
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: "Inter-Light",
    textTransform: "uppercase",
  },
});
