import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Link, Redirect } from "expo-router";
import { useAuth } from "../components/AuthProvider";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from "react-native-reanimated";
import { Heart, ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="hsl(345, 60%, 72%)" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      {/* Background gradients simulated */}
      <View
        style={[
          styles.orb,
          {
            top: -100,
            left: -50,
            backgroundColor: "hsl(345, 50%, 18%)",
            opacity: 0.3,
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          {
            bottom: -100,
            right: -50,
            backgroundColor: "hsl(260, 40%, 18%)",
            opacity: 0.2,
          },
        ]}
      />

      {/* Top bar */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(800)}
        style={styles.topBar}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Heart
              size={14}
              fill="hsl(345, 60%, 72%)"
              color="hsl(345, 60%, 72%)"
            />
          </View>
          <Text style={styles.logoText}>ESITYA</Text>
        </View>
      </Animated.View>

      {/* Hero Content */}
      <View style={styles.heroContent}>
        <Animated.View
          entering={FadeInUp.delay(200).duration(700)}
          style={styles.badge}
        >
          <Heart
            size={10}
            fill="hsl(345, 60%, 72%)"
            color="hsl(345, 60%, 72%)"
          />
          <Text style={styles.badgeText}>A PRIVATE SPACE FOR TWO</Text>
          <Heart
            size={10}
            fill="hsl(345, 60%, 72%)"
            color="hsl(345, 60%, 72%)"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(350).duration(900)}
          style={styles.titleContainer}
        >
          <Text style={styles.titleSerif}>Our</Text>
          <Text style={styles.titleItalic}>Journey</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(550).duration(700)}
          style={styles.dynamicLineContainer}
        >
          <View style={styles.gradientLine} />
          <Text style={styles.animatedWord}>MEMORIES</Text>
          <View style={styles.gradientLine} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(700).duration(700)}
          style={styles.ctaContainer}
        >
          <Link href="/login" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>ENTER OUR WORLD</Text>
              <ArrowRight
                size={14}
                color="hsl(220, 15%, 8%)"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>

      {/* Bottom Bar */}
      <Animated.View
        entering={FadeIn.delay(1100).duration(1000)}
        style={styles.bottomBar}
      >
        <Text style={styles.bottomText}>
          ENCRYPTED ∙ PRIVATE ∙ JUST FOR TWO ♡
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 7%)",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 9999,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 60,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "hsl(345, 40%, 14%)",
    borderColor: "hsl(345, 40%, 22%)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 16,
    letterSpacing: 3,
    color: "hsl(35, 15%, 65%)",
    fontFamily: "CormorantGaramond-Light",
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "hsl(345, 40%, 12%)",
    borderColor: "hsl(345, 40%, 20%)",
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 40,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 4,
    color: "hsl(345, 40%, 55%)",
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  titleSerif: {
    fontSize: 70,
    lineHeight: 70,
    color: "hsl(35, 20%, 88%)",
    fontFamily: "CormorantGaramond-Light",
  },
  titleItalic: {
    fontSize: 70,
    lineHeight: 70,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "CormorantGaramond-Italic",
  },
  dynamicLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  gradientLine: {
    width: 48,
    height: 1,
    backgroundColor: "hsl(345, 40%, 30%)",
  },
  animatedWord: {
    fontSize: 14,
    letterSpacing: 3,
    color: "hsl(35, 15%, 50%)",
    fontFamily: "CormorantGaramond-Light",
  },
  ctaContainer: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 80,
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "hsl(345, 60%, 72%)",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 9999,
    width: 250,
  },
  primaryButtonText: {
    color: "hsl(220, 15%, 8%)",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderColor: "hsl(220, 10%, 22%)",
    borderWidth: 1,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 9999,
    width: 250,
  },
  secondaryButtonText: {
    color: "hsl(35, 15%, 60%)",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "300",
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    zIndex: 10,
  },
  bottomText: {
    fontSize: 9,
    letterSpacing: 4,
    color: "hsl(35, 10%, 22%)",
  },
});
