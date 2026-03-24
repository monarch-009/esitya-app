import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { Send, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

const STAMPS = [
  { id: "feather", emoji: "🪶", label: "Pen" },
  { id: "swan", emoji: "🦢", label: "Grace" },
  { id: "rose", emoji: "🥀", label: "Bloom" },
  { id: "wax", emoji: "🏷️", label: "Seal" },
  { id: "ring", emoji: "💍", label: "Promise" },
  { id: "moon", emoji: "🌘", label: "Night" },
  { id: "sparkle", emoji: "🪄", label: "Magic" },
];

const STYLES = [
  { id: "grid", color: "#F8F9FA", label: "Grid Lines" },
  { id: "ancient", color: "#E6D5B8", label: "Ancient Parchment" },
  { id: "linen", color: "#F0F0F0", label: "Linen" },
  { id: "midnight", color: "#1C1C1E", label: "Slate" },
];

export default function ComposeLetterScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [stamp, setStamp] = useState("feather");
  const [paperStyle, setPaperStyle] = useState("grid");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const selectedStyle = STYLES.find((s) => s.id === paperStyle);
  const isDarkPaper = paperStyle === "midnight";
  const isAncient = paperStyle === "ancient";
  const isGrid = paperStyle === "grid";

  const renderGridLines = () => {
    if (!isGrid) return null;
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 25 }).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.gridLine, 
              { top: 110 + i * 32 }
            ]} 
          />
        ))}
        <View style={styles.gridVerticalLine} />
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
            "Empty Letter",
            "A heart has much to say, please write it down.",
          );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        content,
        stamp,
        paperStyle,
        senderName: user?.name,
      };

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // Save locally for offline sync
        const pendingStr = await AsyncStorage.getItem("pending_letters");
        const pending = pendingStr ? JSON.parse(pendingStr) : [];
        pending.push({
          ...payload,
          _id: `pending_${Date.now()}`,
          date: new Date().toISOString(),
          isRead: false,
          isPending: true,
        });
        await AsyncStorage.setItem("pending_letters", JSON.stringify(pending));
        router.back();
        return;
      }

      await api.post("/letters", payload);
      router.back();
    } catch (e) {
      console.error("Send letter error:", e);
      Alert.alert("Error", "Failed to send your letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <X size={24} color="hsl(35, 10%, 60%)" />
          </Pressable>
          <Text style={styles.headerTitle}>Write a Letter</Text>
          <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.postBtn, loading && styles.postBtnDisabled]}
              >
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Send size={20} color="black" />
            )}
          </Pressable>
        </View>

        <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={true}
            >
          <View
                style={[
              styles.letterPaper,
              {
                backgroundColor: selectedStyle?.color,
              },
              isAncient && styles.ancientPaper,
            ]}
              >
            {renderGridLines()}
            
            <View style={[styles.stampArea, isDarkPaper && styles.stampAreaDark]}>
              <Text style={styles.stampEmoji}>
                {STAMPS.find((s) => s.id === stamp)?.emoji}
              </Text>
            </View>

            <TextInput
                  style={[
                styles.titleInput, 
                isDarkPaper && styles.textDarkBg, 
                isAncient && styles.textAncient
              ]}
                  placeholder="My Dearest..."
                  placeholderTextColor={isDarkPaper ? "rgba(255,255,255,0.2)" : (isAncient ? "rgba(74, 66, 50, 0.3)" : "rgba(0,0,0,0.2)")}
                  value={title}
                  onChangeText={setTitle}
                />

            <View style={[styles.divider, isDarkPaper && styles.dividerDark, isAncient && styles.dividerAncient]} />

            <TextInput
                  style={[
                styles.contentInput, 
                isDarkPaper && styles.textDarkBg, 
                isAncient && styles.textAncient
              ]}
                  placeholder="Write with your heart here..."
                  placeholderTextColor={isDarkPaper ? "rgba(255,255,255,0.2)" : (isAncient ? "rgba(74, 66, 50, 0.3)" : "rgba(0,0,0,0.2)")}
                  multiline
                  value={content}
                  onChangeText={setContent}
                />

            <View style={styles.footer}>
              <Text style={[styles.footerText, isDarkPaper && styles.footerTextDark, isAncient && styles.footerTextAncient]}>Always yours ♡</Text>
            </View>
          </View>

          <View style={styles.customizer}>
            <Text style={styles.sectionLabel}>CHOOSE A STAMP</Text>
            <View style={styles.optionsWrapStamps}>
              {STAMPS.map((s) => (
                <Pressable
                      key={s.id}
                      onPress={() => setStamp(s.id)}
                      style={[
                    styles.optionBtn,
                    stamp === s.id && styles.optionBtnActive,
                  ]}
                    >
                  <Text style={styles.optionEmoji}>{s.emoji}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>PAPER TEXTURE</Text>
            <View style={styles.optionsWrapTextures}>
              {STYLES.map((s) => (
                <Pressable
                      key={s.id}
                      onPress={() => setPaperStyle(s.id)}
                      style={[
                    styles.styleBtn,
                    { backgroundColor: s.color },
                    paperStyle === s.id && styles.styleBtnActive,
                  ]}
                    >
                  {paperStyle === s.id && <View style={styles.activeDot} />}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "CormorantGaramond-Regular",
    letterSpacing: 1,
  },
  cancelBtn: { padding: 8 },
  postBtn: {
    backgroundColor: "hsl(345, 60%, 72%)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  postBtnDisabled: { opacity: 0.3 },
  content: { padding: 20, paddingBottom: 100 },
  letterPaper: {
    padding: 30,
    paddingTop: 85,
    borderRadius: 2,
    minHeight: 520,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  ancientPaper: {
    borderColor: "rgba(139, 128, 106, 0.4)",
    backgroundColor: "#F4E3C5", // Slightly more warm and readable
    borderWidth: 2,
    shadowColor: "#8B4513", // Warm shadow
    shadowOpacity: 0.2,
  },
  gridLine: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(67, 133, 245, 0.12)",
    position: "absolute",
    left: 0,
  },
  gridVerticalLine: {
    width: 2,
    height: "100%",
    backgroundColor: "rgba(255, 100, 100, 0.15)",
    position: "absolute",
    left: 60,
    top: 0,
  },
  stampArea: {
    position: "absolute",
    top: 35,
    right: 35,
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "10deg" }],
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  stampAreaDark: {
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  stampEmoji: { fontSize: 28 },
  titleInput: {
    fontSize: 32,
    fontFamily: "CormorantGaramond-Medium",
    color: "hsl(35, 30%, 15%)",
    marginBottom: 5,
    zIndex: 2, // Ensure text is above grid
  },
  textDarkBg: {
    color: "hsl(35, 10%, 90%)",
  },
  textAncient: {
    color: "#5C4033", // Dark brown ink
    fontFamily: "CormorantGaramond-BoldItalic",
    fontSize: 22, // Slightly larger for handwritten feel
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 20,
    width: "70%",
    zIndex: 2,
  },
  dividerDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerAncient: {
    backgroundColor: "rgba(139, 128, 106, 0.3)",
  },
  contentInput: {
    fontSize: 19,
    fontFamily: "CormorantGaramond-Regular",
    lineHeight: 32,
    color: "hsl(35, 20%, 25%)",
    minHeight: 280,
    textAlignVertical: "top",
    zIndex: 2, // Ensure text is above grid
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.04)",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 15,
    fontFamily: "CormorantGaramond-MediumItalic",
    color: "hsl(35, 10%, 35%)",
  },
  footerTextDark: {
    color: "hsl(35, 5%, 65%)",
  },
  footerTextAncient: {
    color: "#6B5B49",
  },
  customizer: {
    marginTop: 40,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: "hsl(35, 5%, 40%)",
    fontFamily: "Inter-Regular",
    marginBottom: 10,
    paddingLeft: 4,
  },
  optionsWrapStamps: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  optionsWrapTextures: {
    flexDirection: "row",
    gap: 12,
  },
  optionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "hsl(220, 12%, 11%)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  optionBtnActive: {
    borderColor: "hsl(345, 60%, 72%)",
    backgroundColor: "hsl(345, 40%, 12%)",
    borderWidth: 1.5,
  },
  optionEmoji: { fontSize: 20 },
  styleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  styleBtnActive: {
    borderColor: "hsl(345, 60%, 72%)",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "hsl(345, 60%, 72%)",
  },
});


