import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Heart, Plus } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
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
import { useAuth } from "../../components/AuthProvider";
import PostItem from "../../components/space/PostItem";
import api from "../../utils/api";

export default function SpaceScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [viewableItems, setViewableItems] = useState<string[]>([]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    setViewableItems(viewableItems.map((item: any) => item.key));
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, []),
  );

  const fetchPosts = async () => {
    try {
      const cachedStr = await AsyncStorage.getItem("cached_space_posts");
      if (cachedStr) {
        setPosts(JSON.parse(cachedStr));
        setLoading(false); // Immediately stop loading if we have cache
      } else if (!refreshing) {
        setLoading(true);
      }

      const res = await api.get("/posts");
      if (res.data) {
        setPosts(res.data);
        await AsyncStorage.setItem(
          "cached_space_posts",
          JSON.stringify(res.data),
        );
      }
    } catch (e) {
      console.error("Fetch posts error", e);
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.put(`/posts/${postId}`, { action: "like" });
      if (res.data) {
        setPosts(
          posts.map((p) =>
            p._id === postId ? { ...p, likes: res.data.likes } : p,
          ),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.status === 200) {
        setPosts(posts.filter((p) => p._id !== postId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      if (res.data) {
        setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerDecoration}>
          <View style={styles.decorationLine} />
          <Heart
            size={18}
            color="hsl(345, 60%, 72%)"
            fill="hsl(345, 60%, 72%)"
          />
          <View style={styles.decorationLine} />
        </View>
        <Text style={styles.title}>Our Space</Text>
        <Text style={styles.subtitle}>SHARED THOUGHTS · ENDLESS MEMORIES</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="hsl(345, 60%, 72%)"
            colors={["hsl(345, 60%, 72%)"]}
            progressBackgroundColor="hsl(220, 15%, 8%)"
          />
        }
        ListHeaderComponent={<View style={{ height: 20 }} />}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            currentUser={user}
            onLike={() => handleLike(item._id)}
            onComment={(text) => handleComment(item._id, text)}
            onDelete={() => handleDelete(item._id)}
            isViewable={isFocused && viewableItems.includes(item._id)}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              style={{ marginTop: 40 }}
              color="hsl(345, 60%, 72%)"
            />
          ) : (
            <View style={styles.emptyState}>
              <Heart size={40} color="hsl(345, 40%, 25%)" />
              <Text style={styles.emptyText}>
                No space posts yet. Say something! ❤️
              </Text>
            </View>
          )
        }
      />
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/space/compose")}
      >
        <Plus size={24} color="hsl(220, 15%, 8%)" />
      </Pressable>
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
    paddingBottom: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerDecoration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  decorationLine: {
    width: 48,
    height: 1,
    backgroundColor: "hsl(345, 40%, 30%)",
  },
  title: {
    fontSize: 24,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "CormorantGaramond-Light",
    textTransform: "uppercase",
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 10,
    color: "hsl(35, 10%, 38%)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 8,
  },
  listContent: {
    padding: 20,
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
