import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Camera, CloudOff } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../components/AuthProvider";
import SnapItem from "../../components/snap/SnapItem";
import api from "../../utils/api";

export default function SnapScreen() {
  const [snaps, setSnaps] = useState<any[]>([]);
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
      fetchSnaps();
    }, []),
  );

  const syncPendingSnaps = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return;

      const pendingStr = await AsyncStorage.getItem("pending_snaps");
      if (!pendingStr) return;
      let pendingSnaps = JSON.parse(pendingStr);
      if (pendingSnaps.length === 0) return;

      const remainingSnaps = [];

      for (const snap of pendingSnaps) {
        try {
          const formData = new FormData();
          const filename = snap.uri.split("/").pop() || "snap.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          (formData as any).append("file", {
            uri: snap.uri,
            name: filename,
            type: type,
          });

          const uploadRes = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!uploadRes.data.url) throw new Error("Upload failed");

          await api.post("/snaps", {
            mediaUrl: uploadRes.data.url,
            caption: snap.caption,
            mediaType: snap.mediaType,
            isMirrored: snap.isMirrored,
            platform: "mobile",
          });
        } catch (e) {
          console.error("Failed to sync snap", e);
          remainingSnaps.push(snap);
        }
      }

      await AsyncStorage.setItem(
        "pending_snaps",
        JSON.stringify(remainingSnaps),
      );

      if (remainingSnaps.length < pendingSnaps.length) {
        // We successfully uploaded at least one, so fetch again to update the list naturally
        fetchSnaps(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSnaps = async (skipSync = false) => {
    let onlineSnaps = [];
    try {
      const cachedStr = await AsyncStorage.getItem("cached_snaps");
      if (cachedStr) {
        setSnaps(JSON.parse(cachedStr));
        onlineSnaps = JSON.parse(cachedStr); // fallback if fetch errors
        setLoading(false);
      } else if (!refreshing) {
        setLoading(true);
      }

      const res = await api.get("/snaps");
      if (res.data) {
        onlineSnaps = res.data;
        await AsyncStorage.setItem("cached_snaps", JSON.stringify(onlineSnaps));
      }
      if (!skipSync) syncPendingSnaps();
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      // Merge with offline snaps
      try {
        const pendingStr = await AsyncStorage.getItem("pending_snaps");
        if (pendingStr) {
          const pendingSnaps = JSON.parse(pendingStr);
          if (pendingSnaps.length > 0) {
            const fakePending = pendingSnaps.map((p: any, idx: number) => ({
              _id: `pending_${idx}_${p.timestamp}`,
              caption: p.caption,
              mediaUrl: p.uri,
              mediaType: p.mediaType,
              author: user,
              createdAt: new Date(p.timestamp).toISOString(),
              likes: [],
              comments: [],
              isPending: true,
            }));
            setSnaps([...fakePending, ...onlineSnaps]);
          } else {
            setSnaps(onlineSnaps);
          }
        } else {
          setSnaps(onlineSnaps);
        }
      } catch (err) {
        setSnaps(onlineSnaps);
      }
      if (!refreshing) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSnaps();
    setRefreshing(false);
  };

  const handleLike = async (snapId: string) => {
    try {
      const res = await api.post(`/snaps/${snapId}/like`);
      if (res.data) {
        setSnaps(
          snaps.map((p) =>
            p._id === snapId ? { ...p, likes: res.data.likes } : p,
          ),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleComment = async (snapId: string, text: string) => {
    try {
      const res = await api.post(`/snaps/${snapId}/comment`, { text });
      if (res.data) {
        setSnaps(snaps.map((p) => (p._id === snapId ? res.data : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleDelete = async (snapId: string) => {
    try {
      await api.delete(`/snaps/${snapId}`);
      setSnaps(snaps.filter((p) => p._id !== snapId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerDecoration}>
          <View style={styles.decorationLine} />
          <Camera size={18} color="hsl(345, 60%, 72%)" />
          <View style={styles.decorationLine} />
        </View>
        <Text style={styles.title}>Snaps</Text>
        <Text style={styles.subtitle}>
          MOMENTS CAPTURED TOGETHER · SAVED FOREVER HERE
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="hsl(345, 60%, 72%)" />
        </View>
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="hsl(345, 60%, 72%)"
              colors={["hsl(345, 60%, 72%)"]}
              progressBackgroundColor="hsl(220, 15%, 8%)"
            />
          }
          renderItem={({ item }) => (
            <View>
              {item.isPending && (
                <View style={styles.pendingBadge}>
                  <CloudOff size={10} color="hsl(35, 10%, 40%)" />
                  <Text style={styles.pendingText}>
                    Offline - Waiting for sync
                  </Text>
                </View>
              )}
              <SnapItem
                snap={item}
                currentUser={user}
                onLike={() => !item.isPending && handleLike(item._id)}
                onComment={(text) =>
                  !item.isPending && handleComment(item._id, text)
                }
                onDelete={
                  user?.role === "admin" && !item.isPending
                    ? () => handleDelete(item._id)
                    : undefined
                }
                isViewable={isFocused && viewableItems.includes(item._id)}
              />
            </View>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Camera size={40} color="hsl(345, 40%, 25%)" />
              <Text style={styles.emptyStateTitle}>No snaps yet</Text>
              <Text style={styles.emptyStateSub}>Take your first snap 📸</Text>
            </View>
          }
        />
      )}

      {/* Camera FAB */}
      <Pressable
        style={styles.cameraFab}
        onPress={() => router.push("/snap-camera" as any)}
      >
        <Camera size={24} color="hsl(220, 15%, 8%)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  header: {
    paddingTop: 60,
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
    padding: 24,
    paddingBottom: 100, // For the FAB
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: "hsl(35, 15%, 38%)",
  },
  emptyStateSub: {
    fontSize: 12,
    color: "hsl(35, 10%, 30%)",
  },
  cameraFab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "hsl(345, 60%, 72%)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "hsl(345, 60%, 72%)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  pendingText: {
    color: "hsl(35, 10%, 40%)",
    fontSize: 10,
    fontFamily: "Inter-Regular",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
