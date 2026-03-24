import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  CheckCircle2,
  CloudOff,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle as SvgCircle,
} from "react-native-svg";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

function ProgressCircle({ percentage }: { percentage: number }) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressCircleContainer}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <LinearGradient id="bucketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="hsl(345, 60%, 72%)" />
            <Stop offset="100%" stopColor="hsl(25, 65%, 70%)" />
          </LinearGradient>
        </Defs>
        {/* Background circle */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(220, 10%, 16%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#bucketGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View style={styles.percentageWrapper}>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
    </View>
  );
}

export default function BucketScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const canManage =
    user?.role === "admin" || user?.email === "esitayadav2003@gmail.com";

  useEffect(() => {
    fetchBucketItems();
  }, []);

  const syncPendingBuckets = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return;

      const pendingStr = await AsyncStorage.getItem("pending_buckets");
      if (!pendingStr) return;
      const pendingBuckets = JSON.parse(pendingStr);
      if (pendingBuckets.length === 0) return;

      const remaining = [];
      for (const bucket of pendingBuckets) {
        try {
          await api.post("/bucket", { title: bucket.title, completed: false });
        } catch (e) {
          remaining.push(bucket);
        }
      }

      await AsyncStorage.setItem("pending_buckets", JSON.stringify(remaining));
      if (remaining.length < pendingBuckets.length) fetchBucketItems(true);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBucketItems = async (skipSync = false) => {
    try {
      // 1. Initial cached load for instant paint
      const cachedStr = await AsyncStorage.getItem("cached_bucket");
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        setItems(parsed.items || []);
        setStats(parsed.stats || { total: 0, completed: 0 });
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh from online
      let onlineItems = [];
      let nextStats = { total: 0, completed: 0 };
      const res = await api.get("/bucket");
      if (res.data) {
        onlineItems = res.data.items;
        nextStats = res.data.stats;
        await AsyncStorage.setItem("cached_bucket", JSON.stringify(res.data));
      }

      if (!skipSync) syncPendingBuckets();

      // 3. Merge pending bucket items if any exist
      const pendingStr = await AsyncStorage.getItem("pending_buckets");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.length > 0) {
          setItems([...pending, ...onlineItems]);
          // Adjust stats optimistically for pending items
          setStats({
            total: nextStats.total + pending.length,
            completed: nextStats.completed,
          });
          setLoading(false);
          return;
        }
      }

      setItems(onlineItems);
      setStats(nextStats);
    } catch (e) {
      console.error("Fetch bucket error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!titleInput.trim()) return;
    setSubmitting(true);
    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected && !editingId) {
        // Only allow offline CREATION, not editing for now to keep sync logic predictable
        const pendingStr = await AsyncStorage.getItem("pending_buckets");
        const pending = pendingStr ? JSON.parse(pendingStr) : [];
        pending.push({
          _id: `pending_${Date.now()}`,
          title: titleInput,
          completed: false,
          isPending: true,
        });
        await AsyncStorage.setItem("pending_buckets", JSON.stringify(pending));

        setTitleInput("");
        setIsModalOpen(false);
        fetchBucketItems(); // Refresh view
        return;
      }

      if (editingId) {
        await api.put(`/bucket/${editingId}`, { title: titleInput });
      } else {
        await api.post("/bucket", { title: titleInput, completed: false });
      }
      setTitleInput("");
      setEditingId(null);
      setIsModalOpen(false);
      fetchBucketItems();
    } catch (e) {
      console.error("Submit dream error:", e);
      Alert.alert("Error", "Failed to save your dream. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCompleted = async (item: any) => {
    if (!canManage) return;
    try {
      // Optimistic update
      const newItems = items.map((i) =>
        i._id === item._id ? { ...i, completed: !item.completed } : i,
      );
      setItems(newItems);

      const res = await api.put(`/bucket/${item._id}`, {
        completed: !item.completed,
      });
      if (res.data) {
        // Refetch to get updated stats
        fetchBucketItems();
      }
    } catch (e) {
      console.error("Toggle bucket error:", e);
      fetchBucketItems(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Dream",
      "Are you sure you want to permanently remove this from your bucket list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/bucket/${id}`);
              fetchBucketItems();
            } catch (e) {
              console.error("Delete bucket error:", e);
            }
          },
        },
      ],
    );
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    setTitleInput(item.title);
    setIsModalOpen(true);
  };

  const percentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerDecoLine} />
            <Text style={styles.headerSubtitle}>OUR DREAMS</Text>
            <View style={styles.headerDecoLine} />
          </View>
          <Text style={styles.headerTitle}>
            The Bucket <Text style={styles.headerTitleItalic}>List</Text>
          </Text>
          <Text style={styles.headerText}>
            "Adventures we want to share, places to see, and memories waiting
            to be made."
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="hsl(345, 60%, 72%)" />
            <Text style={styles.loaderText}>LOADING DREAMS...</Text>
          </View>
        ) : (
          <View style={styles.mainContent}>
            {/* Progress Card */}
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.progressCard}
            >
              <ProgressCircle percentage={percentage} />
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Progress</Text>
                <Text style={styles.progressStats}>
                  {stats.completed} of {stats.total} accomplished
                </Text>
                <View style={styles.infoDivider} />
                <Text style={styles.progressQuote}>
                  "A dream you dream together is reality."
                </Text>
              </View>
            </Animated.View>

            {/* List content */}
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Star size={48} color="hsl(220, 10%, 20%)" />
                <Text style={styles.emptyText}>
                  Your bucket list is currently empty.
                </Text>
                <Pressable
                  onPress={() => setIsModalOpen(true)}
                  style={styles.emptyAddBtn}
                >
                  <Text style={styles.emptyAddBtnText}>
                    ADD YOUR FIRST DREAM
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {items.map((item, index) => (
                  <Animated.View
                    key={item._id}
                    entering={FadeInUp.delay(100 * index)}
                    style={[
                      styles.itemCard,
                      item.completed && styles.itemCardCompleted,
                      item.isPending && styles.itemCardPending, // pending style
                    ]}
                  >
                    {item.isPending && (
                      <View style={styles.pendingBucketBadge}>
                        <CloudOff size={10} color="hsl(35, 10%, 40%)" />
                      </View>
                    )}
                    <Pressable
                      style={styles.checkBtn}
                      onPress={() => toggleCompleted(item)}
                      disabled={!canManage || item.isPending}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          item.completed && styles.checkboxActive,
                        ]}
                      >
                        {item.completed && (
                          <CheckCircle2 size={18} color="hsl(220, 15%, 8%)" />
                        )}
                      </View>
                    </Pressable>

                    <View style={styles.itemContent}>
                      <Text
                        style={[
                          styles.itemTitle,
                          item.completed && styles.itemTitleCompleted,
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      {item.completed && item.completedDate && (
                        <Text style={styles.completedDate}>
                          COMPLETED{" "}
                          {new Date(item.completedDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>

                    {canManage && !item.isPending && (
                      <View style={styles.itemActions}>
                        <Pressable
                          onPress={() => openEditModal(item)}
                          style={styles.actionBtn}
                        >
                          <Pencil size={14} color="hsl(35, 10%, 45%)" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(item._id)}
                          style={styles.actionBtn}
                        >
                          <Trash2 size={14} color="hsl(0, 50%, 45%)" />
                        </Pressable>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {canManage && !loading && (
        <Pressable
          onPress={() => {
            setEditingId(null);
            setTitleInput("");
            setIsModalOpen(true);
          }}
          style={[styles.addBtn, { bottom: 30 + insets.bottom }]}
        >
          <Plus size={28} color="hsl(345, 60%, 72%)" />
        </Pressable>
      )}

      {/* Modal - Unified for Add/Edit using Animated style for overlay/content */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsModalOpen(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
            pointerEvents="box-none"
          >
            <Animated.View
              entering={SlideInDown}
              style={[
                styles.modalContent,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingId ? "Edit Dream" : "New Dream"}
                  </Text>
                  <Pressable
                    onPress={() => setIsModalOpen(false)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>CANCEL</Text>
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>WHAT'S THE DREAM?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your dream here..."
                    placeholderTextColor="hsl(35, 10%, 30%)"
                    value={titleInput}
                    onChangeText={setTitleInput}
                    autoFocus
                  />

                  <Pressable
                    style={[
                      styles.saveBtn,
                      (!titleInput.trim() || submitting) &&
                        styles.saveBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!titleInput.trim() || submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator
                        size="small"
                        color="hsl(220, 15%, 8%)"
                      />
                    ) : (
                      <Text style={styles.saveBtnText}>
                        {editingId ? "UPDATE DREAM" : "ADD TO LIST"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  headerDecoLine: {
    width: 24,
    height: 1,
    backgroundColor: "hsl(345, 60%, 72%)",
    opacity: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 4,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
  },
  headerTitle: {
    fontSize: 42,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "CormorantGaramond-Light",
    textAlign: "center",
  },
  headerTitleItalic: {
    fontStyle: "italic",
    color: "hsl(345, 60%, 72%)",
  },
  headerText: {
    fontSize: 13,
    color: "hsl(35, 10%, 45%)",
    textAlign: "center",
    fontFamily: "CormorantGaramond-Light",
    fontStyle: "italic",
    marginTop: 10,
    maxWidth: "85%",
    lineHeight: 18,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  progressCard: {
    flexDirection: "row",
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "hsl(220, 10%, 16%)",
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  progressCircleContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 24,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(345, 60%, 72%)",
  },
  progressInfo: {
    flex: 1,
    marginLeft: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(35, 20%, 85%)",
    marginBottom: 2,
  },
  progressStats: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "hsl(35, 10%, 45%)",
    fontFamily: "Inter-Regular",
    textTransform: "uppercase",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 12,
  },
  progressQuote: {
    fontSize: 11,
    color: "hsl(35, 10%, 40%)",
    fontStyle: "italic",
    lineHeight: 14,
    fontFamily: "CormorantGaramond-Light",
  },
  addBtn: {
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
    zIndex: 100,
  },
  loaderContainer: {
    paddingVertical: 100,
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 9,
    letterSpacing: 3,
    color: "hsl(35, 10%, 35%)",
    fontFamily: "Inter-Regular",
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyText: {
    color: "hsl(35, 10%, 40%)",
    fontSize: 14,
    marginTop: 20,
    fontFamily: "CormorantGaramond-Light",
  },
  emptyAddBtn: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  emptyAddBtnText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
    fontWeight: "600",
  },
  listContainer: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "hsl(220, 10%, 16%)",
    padding: 16,
    paddingRight: 8,
  },
  itemCardCompleted: {
    backgroundColor: "hsl(345, 20%, 9%)",
    borderColor: "hsl(345, 30%, 16%)",
  },
  checkBtn: {
    padding: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "hsl(220, 10%, 25%)",
    backgroundColor: "hsl(220, 15%, 15%)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "hsl(345, 60%, 72%)",
    borderColor: "hsl(345, 60%, 72%)",
    shadowColor: "hsl(345, 60%, 72%)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  itemContent: {
    flex: 1,
    paddingLeft: 4,
  },
  itemTitle: {
    fontSize: 16,
    color: "hsl(35, 15%, 80%)",
    fontFamily: "CormorantGaramond-Regular",
  },
  itemTitleCompleted: {
    textDecorationLine: "line-through",
    color: "hsl(35, 10%, 35%)",
  },
  completedDate: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "hsl(345, 40%, 45%)",
    marginTop: 4,
    fontFamily: "Inter-Regular",
  },
  itemActions: {
    flexDirection: "row",
  },
  actionBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 1000,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "hsl(220, 15%, 10%)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(35, 20%, 90%)",
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
  },
  modalBody: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: "hsl(35, 10%, 35%)",
    fontFamily: "Inter-Regular",
  },
  input: {
    backgroundColor: "hsl(220, 15%, 8%)",
    borderWidth: 1,
    borderColor: "hsl(220, 10%, 16%)",
    borderRadius: 16,
    padding: 16,
    color: "hsl(35, 20%, 85%)",
    fontSize: 16,
    fontFamily: "CormorantGaramond-Regular",
  },
  saveBtn: {
    backgroundColor: "hsl(345, 60%, 72%)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 12,
    letterSpacing: 2,
    color: "hsl(220, 15%, 8%)",
    fontFamily: "Inter-Regular",
    fontWeight: "700",
  },
  itemCardPending: {
    opacity: 0.6,
    borderStyle: "dashed",
    borderColor: "hsl(220, 10%, 25%)",
  },
  pendingBucketBadge: {
    position: "absolute",
    top: -6,
    left: 20,
    backgroundColor: "hsl(220, 15%, 8%)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "hsl(220, 10%, 16%)",
    zIndex: 10,
  },
});
