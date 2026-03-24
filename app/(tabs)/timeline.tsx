import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../components/AuthProvider";
import TimelineItem from "../../components/timeline/TimelineItem";
import api from "../../utils/api";

export default function TimelineScreen() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchMemories();
    }, []),
  );

  const fetchMemories = async () => {
    try {
      const cachedStr = await AsyncStorage.getItem("cached_timeline");
      if (cachedStr) {
        setMemories(JSON.parse(cachedStr));
        setLoading(false);
      } else if (!refreshing) {
        setLoading(true);
      }

      const res = await api.get("/memories");
      if (res.data) {
        const sorted = res.data.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setMemories(sorted);
        await AsyncStorage.setItem("cached_timeline", JSON.stringify(sorted));
      }
    } catch (e) {
      console.error("Fetch memories error", e);
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemories();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Animated.View
                entering={FadeInUp.delay(200)}
                style={styles.headerLabel}
              >
                <View style={styles.line} />
                <Text style={styles.label}>THE CHRONICLE</Text>
                <View style={styles.line} />
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(400)}>
                <Text style={styles.title}>
                  Our Beautiful <Text style={styles.italic}>Journey</Text>
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(600)}>
                <Text style={styles.quote}>
                  "Every moment with you is a destination I never want to leave."
                </Text>
              </Animated.View>
            </View>

            {loading && (
              <ActivityIndicator
                style={{ marginTop: 20, marginBottom: 40 }}
                color="hsl(345, 60%, 72%)"
              />
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="hsl(345, 60%, 72%)"
            colors={["hsl(345, 60%, 72%)"]}
            progressBackgroundColor="hsl(220, 15%, 8%)"
          />
        }
        renderItem={({ item, index }) => (
          <TimelineItem memory={item} index={index} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Heart size={40} color="hsl(345, 40%, 25%)" />
              <Text style={styles.emptyText}>
                The chronicle is waiting for its first entry... ❤️
              </Text>
            </View>
          ) : null
        }
      />
      {user?.role === "admin" && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/timeline/compose")}
        >
          <Plus size={24} color="hsl(220, 15%, 8%)" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  line: {
    width: 30,
    height: 1,
    backgroundColor: "hsl(345, 60%, 72%)",
  },
  label: {
    fontSize: 9,
    letterSpacing: 4,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
  },
  title: {
    fontSize: 42,
    color: "hsl(35, 20%, 88%)",
    fontFamily: "CormorantGaramond-Light",
    textAlign: "center",
    lineHeight: 48,
  },
  italic: {
    fontFamily: "CormorantGaramond-Italic",
    color: "hsl(345, 60%, 72%)",
  },
  quote: {
    fontSize: 14,
    color: "hsl(35, 10%, 45%)",
    marginTop: 15,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "Inter-Light",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 15,
  },
  emptyText: {
    color: "hsl(35, 10%, 40%)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "hsl(345, 60%, 72%)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
