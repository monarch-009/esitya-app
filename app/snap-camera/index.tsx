import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { RefreshCw, X, Zap, ZapOff } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function SnapCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("front");
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="hsl(345, 60%, 72%)" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "on" ? "off" : "on"));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      // Take picture at maximum quality to preserve data
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      let finalUri = photo.uri;

      // Always resize and compress for cloud storage, and flip if front camera
      const actions: any[] = [{ resize: { width: 1080 } }];
      if (facing === "front") {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      }

      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        actions,
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      finalUri = processed.uri;

      router.push({
        pathname: "/snap-camera/preview",
        params: {
          uri: finalUri,
          isMirrored: facing === "front" ? "true" : "false",
        },
      } as any);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/snap-camera/preview",
        params: { uri: result.assets[0].uri, isMirrored: "false" },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <X color="white" size={28} />
            </Pressable>
            <Pressable onPress={toggleFlash} style={styles.iconButton}>
              {flash === "on" ? (
                <Zap color="yellow" size={24} />
              ) : (
                <ZapOff color="white" size={24} />
              )}
            </Pressable>
          </View>

          <View style={styles.bottomBar}>
            <Pressable onPress={pickImage} style={styles.sideButton}>
              <View style={styles.galleryPreview} />
            </Pressable>

            <Pressable
              onPress={takePicture}
              disabled={isCapturing}
              style={styles.captureButton}
            >
              <View style={styles.captureInner} />
            </Pressable>

            <Pressable onPress={toggleFacing} style={styles.sideButton}>
              <RefreshCw color="white" size={28} />
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 10,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  sideButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryPreview: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  message: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: "hsl(345, 60%, 72%)",
    padding: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "hsl(220, 15%, 8%)",
    fontWeight: "bold",
  },
});
