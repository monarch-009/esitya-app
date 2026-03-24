import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
} from "react-native";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  ArrowRight,
} from "lucide-react-native";
import { Link, useRouter, Redirect } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "../../components/AuthProvider";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && user) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    const success = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      router.replace("/(tabs)/home" as any);
    } else {
      setError("Wrong credentials. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Orbs */}
      <View
        style={[
          styles.orb,
          {
            bottom: 0,
            right: 0,
            backgroundColor: "hsl(345, 40%, 15%)",
            opacity: 0.2,
            width: 300,
            height: 300,
          },
        ]}
      />

      <View style={styles.header}>
        <Heart size={16} fill="hsl(345, 60%, 72%)" color="hsl(345, 60%, 72%)" />
        <Text style={styles.headerText}>ESITYA</Text>
      </View>

      <View style={styles.innerContainer}>
        <Animated.View entering={FadeInDown.delay(100).duration(800)}>
          <Text style={styles.badge}>WELCOME BACK</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Enter the secret door to our world.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.form}
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Mail size={12} color="hsl(35, 10%, 38%)" />
              <Text style={styles.label}>EMAIL ADDRESS</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="hsl(35, 10%, 28%)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Lock size={12} color="hsl(35, 10%, 38%)" />
              <Text style={styles.label}>PASSWORD</Text>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="hsl(35, 10%, 28%)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={16} color="hsl(35, 10%, 35%)" />
                ) : (
                  <Eye size={16} color="hsl(35, 10%, 35%)" />
                )}
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "ENTERING..." : "ENTER OUR WORLD"}
            </Text>
            {!isSubmitting && (
              <ArrowRight
                size={14}
                color="hsl(220, 15%, 8%)"
                style={{ marginLeft: 8 }}
              />
            )}
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(400).duration(800)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>First time here?</Text>
          <Link href="/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>Create your account</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </View>

      <Text style={styles.bottomNote}>ENCRYPTED ∙ PRIVATE ∙ JUST FOR US</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 7%)",
    justifyContent: "center",
    padding: 24,
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    letterSpacing: 3,
    color: "hsl(35, 15%, 70%)",
    fontFamily: "CormorantGaramond-Light",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  badge: {
    fontSize: 9,
    letterSpacing: 4,
    color: "hsl(345, 40%, 45%)",
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    color: "hsl(35, 20%, 88%)",
    fontFamily: "CormorantGaramond-Light",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "hsl(35, 10%, 38%)",
    fontFamily: "Inter-Light",
    marginBottom: 40,
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(127, 29, 29, 0.2)",
    borderColor: "rgba(127, 29, 29, 0.3)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: "rgba(248, 113, 113, 0.8)",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
  inputGroup: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: "hsl(35, 10%, 38%)",
    fontFamily: "Inter-Regular",
  },
  input: {
    backgroundColor: "hsl(220, 12%, 10%)",
    borderColor: "hsl(220, 10%, 17%)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "hsl(35, 15%, 78%)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "hsl(220, 12%, 10%)",
    borderColor: "hsl(220, 10%, 17%)",
    borderWidth: 1,
    borderRadius: 12,
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    backgroundColor: "hsl(345, 60%, 72%)",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "hsl(220, 15%, 8%)",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "600",
    fontFamily: "Inter-Regular",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: "hsl(35, 10%, 35%)",
    fontFamily: "Inter-Light",
  },
  linkText: {
    fontSize: 14,
    color: "hsl(345, 40%, 55%)",
    fontFamily: "Inter-Light",
  },
  bottomNote: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    fontSize: 9,
    letterSpacing: 3,
    color: "hsl(35, 10%, 20%)",
  },
});
