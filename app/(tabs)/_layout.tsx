import { Tabs } from "expo-router";
import { Home, Clock, Grid, Camera, Mail, List } from "lucide-react-native";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "hsl(220, 15%, 8%)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.05)",
          height: 60 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
        },
        tabBarActiveTintColor: "hsl(345, 60%, 78%)",
        tabBarInactiveTintColor: "hsl(35, 10%, 55%)",
        tabBarLabelStyle: {
          fontFamily: "Inter-Regular",
          fontSize: 10,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          href: null,
          title: "Timeline",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="space"
        options={{
          title: "Space",
          tabBarIcon: ({ color, size }) => <Grid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="snap"
        options={{
          title: "Snap",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.snapIcon}>
              <Camera size={16} color="hsl(345, 60%, 72%)" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="letters"
        options={{
          href: null,
          title: "Letters",
          tabBarIcon: ({ color, size }) => <Mail size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bucket"
        options={{
          href: null,
          title: "Bucket",
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  snapIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "hsl(345, 40%, 12%)",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "hsl(345, 40%, 20%)",
    borderWidth: 1,
    marginTop: -12,
  },
});
