import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function DaysCounter() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calc = () => {
      const startDate = new Date("2022-12-29T00:00:00+05:30");
      const now = new Date();
      // @ts-ignore
      const diffMs = now - startDate;
      setDays(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((diffMs % (1000 * 60)) / 1000));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];

  return (
    <View style={styles.container}>
      {/* Giant background number overlay */}
      <View style={styles.backgroundTextContainer}>
        <Text style={styles.backgroundText}>{days}</Text>
      </View>

      <Animated.View entering={FadeInUp.duration(1000)} style={styles.content}>
        <View style={styles.ornament}>
          <View style={styles.line} />
          <Text style={styles.badge}>SINCE DECEMBER 29, 2022</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.headline}>Together for</Text>

        <View style={styles.grid}>
          {stats.map((stat, i) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {i < stats.length - 1 && i % 2 === 0 && (
                <View style={styles.dot} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.subtext}>
          and counting, every single one with love ❤️
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 80,
    backgroundColor: "hsl(220, 12%, 9%)",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
  },
  backgroundTextContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  backgroundText: {
    fontSize: width * 0.6,
    fontFamily: "CormorantGaramond-Light",
    color: "hsl(220, 10%, 12%)",
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1,
  },
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  line: {
    width: 30,
    height: 1,
    backgroundColor: "hsl(345, 40%, 30%)",
  },
  badge: {
    fontSize: 9,
    letterSpacing: 3,
    color: "hsl(345, 40%, 50%)",
    fontFamily: "Inter-Regular",
  },
  headline: {
    fontSize: 16,
    color: "hsl(35, 10%, 50%)",
    fontFamily: "Inter-Light",
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: 20,
  },
  statBox: {
    width: (width - 80) / 2,
    alignItems: "center",
    marginBottom: 20,
  },
  statValue: {
    fontSize: 48,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "CormorantGaramond-Light",
  },
  statLabel: {
    fontSize: 10,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  dot: {
    // Optional separator
  },
  subtext: {
    fontSize: 12,
    color: "hsl(35, 10%, 35%)",
    fontFamily: "Inter-Light",
    marginTop: 30,
  },
});
