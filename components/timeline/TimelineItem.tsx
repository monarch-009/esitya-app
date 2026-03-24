import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { MapPin, Heart } from "lucide-react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import moment from "moment";

const { width } = Dimensions.get("window");

interface MemoryItemProps {
  memory: any;
  index: number;
}

export default function TimelineItem({ memory, index }: MemoryItemProps) {
  const isLeft = index % 2 === 0;

  return (
    <View style={styles.container}>
      {/* The Dot on the path (simplified for mobile) */}
      <View style={styles.dotContainer}>
        <View style={styles.dotLine} />
        <View style={styles.dot} />
        <View style={styles.dotLine} />
      </View>

      <Animated.View
        entering={isLeft ? FadeInLeft.duration(600) : FadeInRight.duration(600)}
        style={styles.card}
      >
        <View style={styles.content}>
          <Text style={styles.index}>
            #{String(index + 1).padStart(2, "0")}
          </Text>

          {memory.image && (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: memory.image }}
                style={styles.image}
                contentFit="cover"
              />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.date}>
              {moment(memory.date).format("MMMM D, YYYY")}
            </Text>
            <Text style={styles.title}>{memory.title}</Text>
            <Text style={styles.description}>{memory.description}</Text>

            {memory.location && (
              <View style={styles.locationContainer}>
                <MapPin size={10} color="hsl(345, 40%, 40%)" />
                <Text style={styles.locationText}>{memory.location}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 40,
    flexDirection: "row",
  },
  dotContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  dotLine: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(235, 133, 159, 0.2)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "hsl(345, 60%, 72%)",
    marginVertical: 4,
    shadowColor: "hsl(345, 60%, 72%)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    height: "auto",
  },
  content: {
    padding: 16,
  },
  index: {
    fontSize: 9,
    letterSpacing: 2,
    color: "hsl(35, 10%, 35%)",
    marginBottom: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "black",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    gap: 6,
  },
  date: {
    fontSize: 10,
    letterSpacing: 2,
    color: "hsl(345, 40%, 50%)",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    color: "hsl(35, 20%, 85%)",
    fontFamily: "CormorantGaramond-Light",
  },
  description: {
    fontSize: 13,
    color: "hsl(35, 10%, 42%)",
    lineHeight: 18,
    fontFamily: "Inter-Regular",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 10,
    letterSpacing: 1,
    color: "hsl(35, 10%, 35%)",
    textTransform: "uppercase",
  },
});
