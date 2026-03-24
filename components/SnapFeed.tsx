import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Camera, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle as SvgCircle,
} from "react-native-svg";
import api from "../utils/api";

const { width } = Dimensions.get("window");

function SnapRing({
  progress,
  size = 76,
}: {
  progress: number;
  size?: number;
}) {
  const R = size / 2 - 3;
  const circ = 2 * Math.PI * R;
  const dash = (1 - progress) * circ;
  const cx = size / 2,
    cy = size / 2;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <LinearGradient id="snapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="hsl(345, 60%, 72%)" />
            <Stop offset="100%" stopColor="hsl(38, 65%, 68%)" />
          </LinearGradient>
        </Defs>
        <SvgCircle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="hsl(220, 12%, 15%)"
          strokeWidth="2.5"
        />
        <SvgCircle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="url(#snapGrad)"
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export default function SnapFeed() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSnaps();
  }, []);

  const fetchSnaps = async () => {
    try {
      const res = await api.get("/snaps");
      if (res.data) {
        // Filter for last 24h
        const since = Date.now() - 24 * 3600000;
        setSnaps(
          res.data.filter((s: any) => new Date(s.createdAt).getTime() >= since),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    return Math.min(elapsed / (24 * 3600000), 1);
  };

  // No longer returning null here so the "Add Snap" button is always available

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <View style={styles.badge}>
          <Camera size={10} color="hsl(345, 60%, 72%)" />
          <Text style={styles.badgeText}>SNAPS</Text>
          <Text style={styles.badgeDot}>· vanish in 24h</Text>
        </View>
        <View style={styles.headerLine} />
      </View>

      <FlatList
        horizontal
        data={[{ _id: "add-snap", isAdd: true }, ...snaps]}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item, index }) => {
          if (item.isAdd) {
            return (
              <Animated.View entering={FadeInRight.delay(0)}>
                <Pressable
                  style={styles.snapButton}
                  onPress={() => router.push("/snap-camera" as any)}
                >
                  <View style={styles.addSnapCircle}>
                    <Plus size={24} color="hsl(345, 60%, 72%)" />
                  </View>
                  <Text style={styles.snapName}>Add Snap</Text>
                </Pressable>
              </Animated.View>
            );
          }
          const progress = calculateProgress(item.createdAt);
          return (
            <Animated.View entering={FadeInRight.delay(index * 100)}>
              <Pressable
                style={styles.snapButton}
                onPress={() => router.push("/(tabs)/snap")}
              >
                <View style={styles.ringWrapper}>
                  <SnapRing progress={progress} />
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.snapImage}
                    />
                  </View>
                </View>
                <Text style={styles.snapName} numberOfLines={1}>
                  {item.author?.name?.split(" ")[0] || "Us"}
                </Text>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "hsl(345, 40%, 10%)",
    borderWidth: 1,
    borderColor: "hsl(345, 40%, 18%)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 2,
    color: "hsl(345, 40%, 62%)",
    fontFamily: "Inter-Regular",
    fontWeight: "600",
  },
  badgeDot: {
    fontSize: 9,
    color: "hsl(35, 15%, 40%)",
    fontFamily: "Inter-Regular",
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  snapButton: {
    alignItems: "center",
    marginRight: 15,
    gap: 8,
  },
  ringWrapper: {
    width: 76,
    height: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  ringContainer: {
    position: "absolute",
    zIndex: 2,
  },
  avatarWrapper: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "hsl(220, 15%, 10%)",
    overflow: "hidden",
  },
  snapImage: {
    width: "100%",
    height: "100%",
  },
  snapName: {
    fontSize: 10,
    color: "hsl(35, 15%, 60%)",
    fontFamily: "Inter-Regular",
    width: 70,
    textAlign: "center",
  },
  addSnapCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "hsl(345, 40%, 10%)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "hsl(345, 60%, 72%)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5, // Match ring alignment roughly
  },
});
