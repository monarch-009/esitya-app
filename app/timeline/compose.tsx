import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Calendar,
  Image as ImageIcon,
  MapPin,
  Send,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

export default function AddMemoryScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setMedia(result.assets[0]);
  };

  const onDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
            "Missing Info",
            "Please provide at least a title and description.",
          );
      return;
    }
    setLoading(true);
    try {
      let mediaUrl = "";
      if (media) {
        const formData = new FormData();
        const filename = media.uri.split("/").pop() || "upload.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : "jpeg";
        const type = `image/${ext === "png" ? "png" : "jpeg"}`;

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
        mediaUrl = uploadRes.data.url;
      }

      await api.post("/memories", {
        title,
        description,
        date: moment(date).format("YYYY-MM-DD"),
        location,
        image: mediaUrl,
        createdBy: user?.id || user?._id,
      });

      router.back();
    } catch (e: any) {
      console.error("Add memory error:", e);
      const msg =
            e?.response?.data?.message || e.message || "Failed to add memory.";
      Alert.alert("Error", msg);
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
          <Text style={styles.headerTitle}>Add Memory</Text>
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
          <Text style={styles.sectionLabel}>MILESTONE DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>TITLE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                    style={styles.titleInput}
                    placeholder="What happened?"
                    placeholderTextColor="hsl(35, 10%, 25%)"
                    value={title}
                    onChangeText={setTitle}
                    multiline={false}
                  />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>WHEN & WHERE</Text>
            <View style={styles.rowWrapper}>
              <Pressable 
                style={styles.row}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.inputIcon}>
                  <Calendar size={18} color="hsl(345, 60%, 72%)" />
                </View>
                <Text style={styles.dateDisplayText}>
                  {moment(date).format("MMMM D, YYYY")}
                </Text>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </Pressable>

              <View style={styles.row}>
                <View style={styles.inputIcon}>
                  <MapPin size={18} color="hsl(345, 60%, 72%)" />
                </View>
                <TextInput
                      style={styles.smallInput}
                      placeholder="Where were we?"
                      placeholderTextColor="hsl(35, 10%, 25%)"
                      value={location}
                      onChangeText={setLocation}
                    />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>THE STORY</Text>
            <View style={[styles.inputWrapper, styles.multilineWrapper]}>
              <TextInput
                style={styles.descInput}
                placeholder="Tell the story of this moment... ❤️"
                placeholderTextColor="hsl(35, 10%, 25%)"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>MEMORIES</Text>
            {media ? (
              <View style={styles.mediaPreviewContainer}>
                <RNImage
                  source={{ uri: media.uri }}
                  style={styles.mediaPreview}
                />
                <Pressable
                  onPress={() => setMedia(null)}
                  style={styles.removeMediaBtn}
                >
                  <X size={16} color="white" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                style={styles.mediaPlaceholder}
              >
                <View style={styles.placeholderIconFrame}>
                  <ImageIcon size={28} color="hsl(345, 60%, 72%)" />
                </View>
                <Text style={styles.placeholderText}>ADD A PHOTO</Text>
              </Pressable>
            )}
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
    elevation: 4,
    shadowColor: "hsl(345, 60%, 72%)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  postBtnDisabled: { opacity: 0.3 },
  content: { padding: 24, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 4,
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Regular",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
    marginBottom: 10,
    paddingLeft: 4,
  },
  inputWrapper: {
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  multilineWrapper: {
    minHeight: 180,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 22,
    color: "hsl(35, 20%, 88%)",
    fontFamily: "CormorantGaramond-Medium",
  },
  rowWrapper: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "hsl(220, 12%, 11%)",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  inputIcon: { width: 32, alignItems: "center" },
  smallInput: {
    flex: 1,
    height: "100%",
    color: "hsl(35, 15%, 80%)",
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  dateDisplayText: {
    flex: 1,
    color: "hsl(35, 15%, 80%)",
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  descInput: {
    fontSize: 17,
    color: "hsl(35, 10%, 80%)",
    fontFamily: "CormorantGaramond-Light",
    lineHeight: 24,
    textAlignVertical: "top",
  },
  mediaPlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "hsl(220, 12%, 11%)",
    gap: 12,
  },
  placeholderIconFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(235, 133, 159, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "hsl(35, 10%, 40%)",
    fontFamily: "Inter-Regular",
  },
  mediaPreviewContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mediaPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  removeMediaBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

