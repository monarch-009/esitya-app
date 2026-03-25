import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";

import quotesData from "../utils/quotes.json";

// Extract just the text array and optionally randomize it
const allQuotes = quotesData.map((q: any) => q.text);

// We'll just shuffle them once on mount so it feels fresh
const shuffledQuotes = [...allQuotes].sort(() => 0.5 - Math.random());

const { width } = Dimensions.get("window");

export default function LoveQuotes() {
  const [index, setIndex] = useState(0);
  const [quotes] = useState<string[]>(shuffledQuotes);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 15000); // 15 seconds per quote as requested
    return () => clearInterval(interval);
  }, [quotes]);

  return (
    <View style={styles.container}>
      {/* Decorative lines */}

      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.duration(1000)}
        >
          <Text style={styles.quoteMark}>"</Text>
        </Animated.View>

        <View style={styles.quoteContainer}>
          <Animated.View
            key={index}
            entering={FadeInUp.duration(800)}
            exiting={FadeOutDown.duration(800)}
          >
            <Text style={styles.quoteText}>{quotes[index]}</Text>
          </Animated.View>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    backgroundColor: "hsl(220, 15%, 8%)",
    alignItems: "center",
  },
  topLine: {
    width: "80%",
    height: 1,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    position: "absolute",
    top: 0,
  },
  bottomLine: {
    width: "80%",
    height: 1,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    position: "absolute",
    bottom: 0,
  },
  content: {
    width: "100%",
    paddingHorizontal: 40,
    alignItems: "center",
  },
  quoteMark: {
    fontSize: 84,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "CormorantGaramond-Light",
    opacity: 0.12,
    marginBottom: -40,
  },
  quoteContainer: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  quoteText: {
    fontSize: 20,
    color: "hsl(35, 15%, 70%)",
    fontFamily: "CormorantGaramond-Italic",
    textAlign: "center",
    lineHeight: 28,
  },
  paginationTextContainer: {
    marginTop: 30,
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: "hsl(345, 40%, 15%)",
    borderRadius: 12,
  },
  paginationText: {
    fontSize: 10,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
    letterSpacing: 1,
  },
});
