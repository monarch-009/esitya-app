import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut, Heart, Shield, Bell } from "lucide-react-native";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to exit our private space?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <User size={36} color="hsl(345, 60%, 72%)" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || "Beloved One"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "Connected Forever"}
          </Text>

          <View style={styles.statusBadge}>
            <Heart
              size={10}
              color="hsl(345, 60%, 72%)"
              fill="hsl(345, 60%, 72%)"
            />
            <Text style={styles.statusText}>Connected Space</Text>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Preferences</Text>

          <Pressable style={styles.settingsItem}>
            <Bell size={20} color="hsl(35, 20%, 90%)" />
            <Text style={styles.settingsItemText}>Push Notifications</Text>
          </Pressable>

          <Pressable style={styles.settingsItem}>
            <Shield size={20} color="hsl(35, 20%, 90%)" />
            <Text style={styles.settingsItemText}>Privacy & Sync</Text>
          </Pressable>
        </View>

        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="hsl(345, 60%, 72%)" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>Our Journey v1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(35, 20%, 90%)",
    letterSpacing: 2,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 50,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    borderWidth: 1,
    borderColor: "hsl(345, 60%, 72%)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(35, 20%, 90%)",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Inter-Light",
    color: "hsl(35, 10%, 65%)",
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "hsl(345, 60%, 72%)",
    fontFamily: "Inter-Light",
    fontSize: 12,
  },
  settingsGroup: {
    marginBottom: 40,
  },
  groupTitle: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "hsl(35, 10%, 50%)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 15,
    marginLeft: 5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  settingsItemText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "hsl(35, 20%, 90%)",
  },
  logoutContainer: {
    marginTop: "auto",
    marginBottom: 40,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(235, 133, 159, 0.1)",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "hsl(345, 60%, 72%)",
    fontWeight: "600",
  },
  versionText: {
    fontFamily: "Inter-Light",
    fontSize: 12,
    color: "hsl(35, 10%, 40%)",
  },
});
