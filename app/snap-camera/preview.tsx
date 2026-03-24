import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Send, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

const { width, height } = Dimensions.get("window");

export default function SnapPreviewScreen() {
  const { uri, isMirrored } = useLocalSearchParams<{
    uri: string;
    isMirrored: string;
  }>();
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!uri || isUploading) return;

    try {
      setIsUploading(true);

      const netInfo = await NetInfo.fetch();
      const isOnline =
        netInfo.isConnected && netInfo.isInternetReachable !== false;

      // 1. Move to permanent local storage just in case
      const filename = uri.split("/").pop() || `snap-${Date.now()}.jpg`;
      const permanentUri = `${(FileSystem as any).documentDirectory}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(permanentUri);
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({ from: uri, to: permanentUri });
      }

      const snapPayload = {
        uri: permanentUri,
        mediaType: "image",
        caption: caption || "✨",
        isMirrored: isMirrored === "true",
        timestamp: Date.now(),
      };

      if (isOnline) {
        // Upload immediately
        const formData = new FormData();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        (formData as any).append("file", {
          uri: permanentUri,
          name: filename,
          type: type,
        });

        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!uploadRes.data.url) throw new Error("Upload failed");

        const response = await api.post("/snaps", {
          mediaUrl: uploadRes.data.url,
          caption: snapPayload.caption,
          mediaType: snapPayload.mediaType,
          isMirrored: snapPayload.isMirrored,
          platform: "mobile",
        });

        if (response.status !== 201) throw new Error("Snap Creation Failed");
      } else {
        // Save to pending queue
        const pendingStr = await AsyncStorage.getItem("pending_snaps");
        const pendingSnaps = pendingStr ? JSON.parse(pendingStr) : [];
        pendingSnaps.push(snapPayload);
        await AsyncStorage.setItem(
          "pending_snaps",
          JSON.stringify(pendingSnaps),
        );
        alert("Saved offline. Will upload when connected.");
      }

      router.dismissAll();
      router.replace("/(tabs)/snap");
    } catch (e) {
      console.error("Upload Error:", e);
      // Fallback: save offline
      try {
        const filename = uri.split("/").pop() || `snap-${Date.now()}.jpg`;
        const permanentUri = `${(FileSystem as any).documentDirectory}${filename}`;

        const fileInfo = await FileSystem.getInfoAsync(permanentUri);
        if (!fileInfo.exists) {
          await FileSystem.copyAsync({ from: uri, to: permanentUri });
        }

        const snapPayload = {
          uri: permanentUri,
          mediaType: "image",
          caption: caption || "✨",
          isMirrored: isMirrored === "true",
          timestamp: Date.now(),
        };
        const pendingStr = await AsyncStorage.getItem("pending_snaps");
        const pendingSnaps = pendingStr ? JSON.parse(pendingStr) : [];
        pendingSnaps.push(snapPayload);
        await AsyncStorage.setItem(
          "pending_snaps",
          JSON.stringify(pendingSnaps),
        );

        alert("Network issue. Saved offline.");
        router.dismissAll();
        router.replace("/(tabs)/snap");
      } catch (err) {
        alert("Failed to upload or save snap.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <X color="white" size={24} />
          </Pressable>
          <Text style={styles.headerText}>Preview</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a secret note..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={handleUpload}
              disabled={isUploading}
              style={[styles.sendButton, isUploading && { opacity: 0.7 }]}
            >
              {isUploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>POST SNAP</Text>
                  <Send color="white" size={18} />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontFamily: "CormorantGaramond-Regular",
    letterSpacing: 1.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  captionInput: {
    color: "white",
    fontSize: 16,
    paddingVertical: 10,
    fontFamily: "Inter-Regular",
    minHeight: 40,
    maxHeight: 100,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sendButton: {
    backgroundColor: "hsl(345, 60%, 72%)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "hsl(345, 60%, 72%)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "Inter-Regular",
  },
});
