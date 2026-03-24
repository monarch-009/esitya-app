import { useVideoPlayer, VideoView } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Globe,
  Image as ImageIcon,
  Instagram as InstaIcon,
  Link as LinkIcon,
  MapPin,
  Send,
  Twitter,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

function VideoPreview({ uri, style }: { uri: string; style: any }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
export default function ComposePostScreen() {
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [media, setMedia] = useState<any>(null);
  const [platform, setPlatform] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [fetchingLink, setFetchingLink] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const handleFetchLink = async () => {
    if (!link.trim()) return;
    setFetchingLink(true);
    try {
      let endpoint = "";
      if (link.includes("twitter.com") || link.includes("x.com")) {
        endpoint = "/fetch-twitter";
      } else if (link.includes("instagram.com")) {
        endpoint = "/fetch-instagram";
      } else {
        Alert.alert(
          "Not supported",
          "Only Twitter/X and Instagram links are supported for now.",
        );
        return;
      }

      const res = await api.post(endpoint, { url: link });
      if (res.data.mediaUrl) {
        setMedia({
          uri: res.data.mediaUrl,
          type: res.data.mediaType || "image",
        });
        if (link.includes("twitter")) setPlatform("Twitter");
        else setPlatform("Instagram");
      }
    } catch (e) {
      console.error("Fetch link error:", e);
      Alert.alert("Error", "Failed to fetch media from the provided link.");
    } finally {
      setFetchingLink(false);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !media) return;
    setLoading(true);
    try {
      let finalMediaUrl = media?.uri || "";
      let mediaType = media?.type || "image";

      if (media && !media.uri.startsWith("http")) {
        const formData = new FormData();
        const filename = media.uri.split("/").pop() || "upload.jpg";
        const match = /\.(\w+)$/.exec(filename);

        const ext = match ? match[1].toLowerCase() : "jpeg";
        const type =
          ext === "mp4" || ext === "mov"
            ? `video/${ext}`
            : `image/${ext === "png" ? "png" : "jpeg"}`;

        (formData as any).append("file", {
          uri: media.uri,
          name: filename,
          type,
        });

        const uploadRes = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        finalMediaUrl = uploadRes.data.url;
        mediaType = type.includes("video") ? "video" : "image";
      }

      const postData = {
        caption,
        mediaUrl: finalMediaUrl,
        mediaType,
        platform: platform === "Standard" ? "custom" : platform.toLowerCase(),
        author: user?.id || user?._id,
      };

      await api.post("/posts", postData);
      router.back();
    } catch (e: any) {
      console.error("Submit post error:", e);
      const msg =
        e?.response?.data?.message || e.message || "Failed to share your post.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerAction}>
            <X size={22} color="hsl(35, 10%, 65%)" />
          </Pressable>
          <Text style={styles.headerTitle}>New Post</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={loading || (!caption && !media)}
            style={[
              styles.shareBtn,
              (loading || (!caption && !media)) && styles.shareBtnDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.shareBtnText}>Share</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Info & Caption Area */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.formGroup}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{user?.name || "Anonymous"}</Text>
                <Text style={styles.authorMeta}>Posting to Space</Text>
              </View>
            </View>

            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="What's on your mind?"
                placeholderTextColor="hsl(35, 5%, 35%)"
                multiline
                value={caption}
                onChangeText={setCaption}
                selectionColor="hsl(345, 60%, 72%)"
              />
            </View>
          </Animated.View>

          {/* Media Preview Area */}
          {media ? (
            <Animated.View entering={FadeInUp} style={styles.mediaContainer}>
              {media.type && media.type.includes("video") ? (
                <VideoPreview uri={media.uri} style={styles.mediaContent} />
              ) : (
                <RNImage
                  source={{ uri: media.uri }}
                  style={styles.mediaContent}
                />
              )}
              <Pressable
                onPress={() => setMedia(null)}
                style={styles.removeMediaFab}
              >
                <X size={14} color="white" />
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200)} style={styles.addMediaSection}>
              <Text style={styles.label}>ATTACH MEDIA</Text>
              <View style={styles.mediaGrid}>
                <Pressable onPress={handlePickImage} style={styles.mediaTile}>
                  <View style={[styles.tileIcon, { backgroundColor: "rgba(150, 230, 200, 0.1)" }]}>
                    <ImageIcon size={24} color="hsl(150, 60%, 72%)" />
                  </View>
                  <Text style={styles.tileLabel}>Library</Text>
                </Pressable>

                <Pressable style={styles.mediaTile} onPress={() => {}}>
                   <View style={[styles.tileIcon, { backgroundColor: "rgba(235, 133, 159, 0.1)" }]}>
                    <MapPin size={24} color="hsl(345, 60%, 72%)" />
                  </View>
                  <Text style={styles.tileLabel}>Location</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Social Import Section */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.formGroup}>
            <Text style={styles.label}>IMPORT FROM SOCIAL</Text>
            <View style={styles.linkField}>
              <LinkIcon size={16} color="hsl(35, 10%, 45%)" />
              <TextInput
                style={styles.linkInput}
                placeholder="Paste Instagram or Twitter link..."
                placeholderTextColor="hsl(35, 5%, 30%)"
                value={link}
                onChangeText={setLink}
                onBlur={handleFetchLink}
                autoCapitalize="none"
              />
              {fetchingLink && (
                <ActivityIndicator size="small" color="hsl(345, 60%, 72%)" />
              )}
            </View>
            <Text style={styles.fieldHint}>Fetch posts automatically from other platforms</Text>
          </Animated.View>

          {/* Platform Style Selector */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.formGroup}>
            <Text style={styles.label}>DESIGN STYLE</Text>
            <View style={styles.platformTabs}>
              {["Standard", "Twitter", "Instagram"].map((p) => {
                const isActive = platform === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPlatform(p)}
                    style={[styles.tab, isActive && styles.tabActive]}
                  >
                    <View style={styles.tabContent}>
                      {p === "Twitter" ? (
                        <Twitter size={12} color={isActive ? "black" : "hsl(35, 10%, 60%)"} />
                      ) : p === "Instagram" ? (
                        <InstaIcon size={12} color={isActive ? "black" : "hsl(35, 10%, 60%)"} />
                      ) : (
                        <Globe size={12} color={isActive ? "black" : "hsl(35, 10%, 60%)"} />
                      )}
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{p}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
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
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "hsl(35, 20%, 90%)",
    fontFamily: "CormorantGaramond-SemiBold",
    letterSpacing: 0.5,
  },
  shareBtn: {
    backgroundColor: "hsl(345, 60%, 72%)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnDisabled: {
    opacity: 0.4,
  },
  shareBtnText: {
    color: "hsl(220, 15%, 8%)",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter-SemiBold",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: 32,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "hsl(345, 20%, 12%)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(235, 133, 159, 0.2)",
  },
  avatarText: {
    color: "hsl(345, 60%, 72%)",
    fontSize: 16,
    fontFamily: "CormorantGaramond-Regular",
  },
  authorName: {
    color: "hsl(35, 15%, 85%)",
    fontSize: 15,
    fontFamily: "CormorantGaramond-Medium",
  },
  authorMeta: {
    fontSize: 9,
    color: "hsl(35, 5%, 45%)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 1,
  },
  captionContainer: {
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    minHeight: 160,
  },
  captionInput: {
    fontSize: 18,
    color: "hsl(35, 10%, 88%)",
    fontFamily: "CormorantGaramond-Light",
    lineHeight: 24,
    textAlignVertical: "top",
  },
  mediaContainer: {
    marginBottom: 32,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mediaContent: {
    width: "100%",
    height: "100%",
  },
  removeMediaFab: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  addMediaSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    color: "hsl(35, 5%, 40%)",
    fontFamily: "Inter-Medium",
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: "row",
    gap: 12,
  },
  mediaTile: {
    flex: 1,
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tileLabel: {
    fontSize: 12,
    color: "hsl(35, 10%, 75%)",
    fontFamily: "CormorantGaramond-Medium",
  },
  linkField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "hsl(220, 15%, 9%)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  linkInput: {
    flex: 1,
    color: "hsl(35, 15%, 80%)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  fieldHint: {
    fontSize: 10,
    color: "hsl(35, 5%, 35%)",
    fontFamily: "Inter-Regular",
    marginTop: 8,
    fontStyle: "italic",
  },
  platformTabs: {
    flexDirection: "row",
    backgroundColor: "hsl(220, 15%, 7%)",
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "hsl(35, 20%, 90%)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    color: "hsl(35, 5%, 50%)",
    fontFamily: "Inter-Medium",
  },
  tabTextActive: {
    color: "black",
    fontWeight: "700",
  },
});
