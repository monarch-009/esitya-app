import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRouter } from "expo-router";
import { CloudOff, Feather, Heart, Mail, X } from "lucide-react-native";
import moment from "moment";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

export default function LettersScreen() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchLetters();
    }, []),
  );

  const syncPendingLetters = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return;
      const pendingStr = await AsyncStorage.getItem("pending_letters");
      if (!pendingStr) return;
      const pendingLetters = JSON.parse(pendingStr);
      if (pendingLetters.length === 0) return;

      const remaining = [];
      for (const letter of pendingLetters) {
        try {
          const { _id, isPending, date, isRead, ...payload } = letter;
          await api.post("/letters", payload);
        } catch (e) {
          remaining.push(letter);
        }
      }
      await AsyncStorage.setItem("pending_letters", JSON.stringify(remaining));
      if (remaining.length < pendingLetters.length) fetchLetters(true);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLetters = async (skipSync = false) => {
    try {
      const cachedStr = await AsyncStorage.getItem("cached_letters");
      if (cachedStr) {
        setLetters(JSON.parse(cachedStr));
        setLoading(false);
      } else if (!refreshing) {
        setLoading(true);
      }

      let onlineLetters = [];
      const res = await api.get("/letters");
      if (res.data) {
        onlineLetters = res.data;
        await AsyncStorage.setItem("cached_letters", JSON.stringify(res.data));
      }

      if (!skipSync) syncPendingLetters();

      // Merge with offline
      const pendingStr = await AsyncStorage.getItem("pending_letters");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.length > 0) {
          setLetters([...pending, ...onlineLetters]);
          setLoading(false);
          return;
        }
      }
      setLetters(onlineLetters);
    } catch (e) {
      console.error(e);
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  };

  const stampEmoji = (stamp: string) => {
    if (stamp === "rose") return "🌹";
    if (stamp === "butterfly") return "🦋";
    return "♡";
  };

  const openLetter = (letter: any) => {
    setSelectedLetter(letter);
    // Note: We'd normally call mark-read API here
  };

  const renderLetterItem = ({ item }: { item: any }) => {
    const isMyLetter =
      item.senderId === user?.id || item.senderId === user?._id;
    const isUnread = !isMyLetter && !item.isRead;

    return (
      <Pressable
        onPress={() => openLetter(item)}
        style={styles.letterCardContainer}
      >
        {isUnread ? (
          <View style={styles.sealedEnvelope}>
            <View style={styles.envelopeFlap} />
            <View style={styles.waxSeal}>
              <Text style={styles.waxSealText}>♡</Text>
            </View>
            <View style={styles.unreadBadge} />
            <Text style={styles.envelopeLabel}>FOR YOU</Text>
          </View>
        ) : (
          <View
            style={[styles.openLetter, item.isPending && styles.pendingLetter]}
          >
            {item.isPending && (
              <View style={styles.pendingBadge}>
                <CloudOff size={10} color="hsl(35, 10%, 40%)" />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
            <View style={styles.stampCorner}>
              <Text style={styles.stampText}>{stampEmoji(item.stamp)}</Text>
            </View>
            <Text style={styles.statusLabel}>
              {isMyLetter ? "SENT" : "RECEIVED"}
            </Text>
            <Text style={styles.letterTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.letterDate}>
              {moment(item.date).format("MMMM D, YYYY")}
            </Text>
            <View style={styles.readIndicator}>
              <Heart
                size={10}
                color={item.isRead ? "hsl(150, 60%, 45%)" : "hsl(35, 10%, 30%)"}
                fill={item.isRead ? "hsl(150, 60%, 45%)" : "transparent"}
              />
              <Text style={styles.readText}>
                {item.isRead ? "Read" : "Delivered"}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={letters}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerOrnament}>FROM THE HEART</Text>
              <Text style={styles.title}>Letters to You</Text>
              <Text style={styles.quote}>
                "I choose to write to you slowly, deliberately, and eternally."
              </Text>
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
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={renderLetterItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Mail size={40} color="hsl(345, 40%, 25%)" />
              <Text style={styles.emptyText}>
                No letters yet. Write the first one! ❤️
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Write Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/letters/compose")}
      >
        <Feather size={24} color="hsl(345, 60%, 72%)" />
      </Pressable>

      {/* Selected Letter Reader View */}
      {selectedLetter && (
        <Animated.View
          entering={SlideInDown}
          style={[styles.readerOverlay, { paddingTop: insets.top }]}
        >
          <View style={styles.readerModal}>
            <View style={styles.readerHeader}>
              <Pressable
                onPress={() => setSelectedLetter(null)}
                style={styles.closeBtn}
              >
                <X size={24} color="hsl(35, 10% , 40%)" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.readerContent}>
              <View style={styles.readerStamp}>
                <Text style={styles.readerStampText}>
                  {stampEmoji(selectedLetter.stamp)}
                </Text>
              </View>
              <Text style={styles.readerDate}>
                {moment(selectedLetter.date).format("dddd, MMMM D, YYYY")}
              </Text>
              <Text style={styles.readerTitle}>{selectedLetter.title}</Text>
              <Text style={styles.readerAuthor}>
                From {selectedLetter.senderName || "Anonymous"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.readerBody}>{selectedLetter.content}</Text>

              <View style={styles.readerFooter}>
                <View style={styles.footerLine} />
                <Text style={styles.footerValediction}>Forever Yours ♡</Text>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      )}
    </View>
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
  headerOrnament: {
    fontSize: 9,
    letterSpacing: 4,
    color: "hsl(345, 40%, 45%)",
    marginBottom: 10,
    fontFamily: "Inter-Regular",
  },
  title: {
    fontSize: 36,
    color: "hsl(35, 20%, 88%)",
    fontFamily: "CormorantGaramond-Light",
    textAlign: "center",
  },
  quote: {
    fontSize: 13,
    color: "hsl(35, 10%, 40%)",
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "CormorantGaramond-Light",
    maxWidth: "80%",
  },
  listContent: {
    padding: 10,
    paddingBottom: 100,
  },
  letterCardContainer: {
    width: (width - 40) / 2,
    aspectRatio: 1.2,
    margin: 5,
  },
  sealedEnvelope: {
    flex: 1,
    backgroundColor: "hsl(345, 20%, 12%)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "hsl(345, 30%, 22%)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  envelopeFlap: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "60%",
    backgroundColor: "hsl(345, 25%, 14%)",
    // We'd use a triangle path in SVG if needed
  },
  waxSeal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "hsl(345, 45%, 18%)",
    borderWidth: 2,
    borderColor: "hsl(345, 50%, 25%)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  waxSealText: {
    color: "hsl(345, 60%, 72%)",
    fontSize: 20,
    fontFamily: "CormorantGaramond-Regular",
  },
  unreadBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "hsl(345, 60%, 65%)",
  },
  envelopeLabel: {
    position: "absolute",
    bottom: 12,
    fontSize: 8,
    letterSpacing: 2,
    color: "hsl(345, 40%, 55%)",
  },
  openLetter: {
    flex: 1,
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stampCorner: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 30,
    borderWidth: 1,
    borderColor: "rgba(235, 133, 159, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "6deg" }],
  },
  stampText: {
    fontSize: 12,
  },
  statusLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: "hsl(345, 40%, 45%)",
    marginBottom: 8,
  },
  letterTitle: {
    fontSize: 16,
    color: "hsl(35, 20%, 80%)",
    fontFamily: "CormorantGaramond-Light",
    textAlign: "center",
  },
  letterDate: {
    fontSize: 9,
    color: "hsl(35, 10%, 38%)",
    fontStyle: "italic",
    marginTop: 4,
  },
  readIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  readText: {
    fontSize: 8,
    color: "hsl(35, 10%, 30%)",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "hsl(345, 40%, 14%)",
    borderWidth: 1,
    borderColor: "hsl(345, 40%, 25%)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  readerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 100,
  },
  readerModal: {
    flex: 1,
    backgroundColor: "hsl(35, 12%, 10%)",
  },
  readerHeader: {
    height: 50,
    alignItems: "flex-end",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  closeBtn: {
    padding: 5,
  },
  readerContent: {
    padding: 30,
    paddingBottom: 60,
  },
  readerStamp: {
    position: "absolute",
    top: 20,
    right: 30,
    width: 50,
    height: 65,
    borderWidth: 2,
    borderColor: "rgba(235, 133, 159, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "12deg" }],
  },
  readerStampText: {
    fontSize: 30,
  },
  readerDate: {
    fontSize: 10,
    letterSpacing: 3,
    color: "hsl(35, 10%, 35%)",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  readerTitle: {
    fontSize: 38,
    lineHeight: 44,
    color: "hsl(35, 20%, 82%)",
    fontFamily: "CormorantGaramond-Light",
  },
  readerAuthor: {
    fontSize: 16,
    fontStyle: "italic",
    color: "hsl(35, 10%, 40%)",
    fontFamily: "CormorantGaramond-Light",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 30,
  },
  readerBody: {
    fontSize: 18,
    lineHeight: 32,
    color: "hsl(35, 15%, 65%)",
    fontFamily: "CormorantGaramond-Light",
  },
  readerFooter: {
    alignItems: "center",
    marginTop: 50,
    gap: 15,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: "hsl(345, 30%, 22%)",
  },
  footerValediction: {
    fontSize: 16,
    fontStyle: "italic",
    color: "hsl(35, 10%, 38%)",
    fontFamily: "CormorantGaramond-Light",
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
  pendingLetter: {
    opacity: 0.7,
    borderStyle: "dashed",
    borderColor: "hsl(35, 10%, 30%)",
  },
  pendingBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: "hsl(220, 15%, 8%)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "hsl(35, 10%, 20%)",
    zIndex: 10,
  },
  pendingText: {
    fontSize: 8,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
    textTransform: "uppercase",
  },
});
