import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, X, Clock, Mail, List, User } from "lucide-react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import Hero from "../../components/Hero";
import SnapFeed from "../../components/SnapFeed";
import DaysCounter from "../../components/DaysCounter";
import LoveQuotes from "../../components/LoveQuotes";

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const handleNavigate = (path: any) => {
    setMenuVisible(false);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Journey</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
        >
          <Menu size={24} color="hsl(35, 20%, 90%)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Hero />
        <SnapFeed />
        <DaysCounter />
        <LoveQuotes />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Navigation Modal */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Menu</Text>
            <TouchableOpacity
              onPress={() => setMenuVisible(false)}
              style={styles.closeButton}
            >
              <X size={28} color="hsl(35, 20%, 90%)" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/(tabs)/timeline")}
            >
              <Clock size={24} color="hsl(345, 60%, 72%)" />
              <Text style={styles.menuItemText}>Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/(tabs)/letters")}
            >
              <Mail size={24} color="hsl(345, 60%, 72%)" />
              <Text style={styles.menuItemText}>Letters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/(tabs)/bucket")}
            >
              <List size={24} color="hsl(345, 60%, 72%)" />
              <Text style={styles.menuItemText}>Bucket List</Text>
            </TouchableOpacity>

            {/* In a real project you can add a generic Profile page. Mapping back to Home/Profile if no dedicated page yet */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate("/(tabs)/profile")}
            >
              <User size={24} color="hsl(345, 60%, 72%)" />
              <Text style={styles.menuItemText}>Profile & Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(35, 20%, 90%)",
    letterSpacing: 2,
  },
  menuButton: {
    padding: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
  },
  content: {
    paddingBottom: 40,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "hsl(220, 15%, 8%)",
    paddingTop: Platform.OS === "android" ? 30 : 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "CormorantGaramond-Regular",
    color: "hsl(345, 60%, 72%)",
    letterSpacing: 1,
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    paddingTop: 30,
    paddingHorizontal: 20,
    gap: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "hsl(35, 20%, 90%)",
    letterSpacing: 1,
  },
});
