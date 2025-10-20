import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerTitle: "Client Intel", tabBarActiveTintColor: "#2563EB" }}>
      <Tabs.Screen
        name="CompanyInfoScreen"
        options={{
          title: "Company Info",
          tabBarIcon: ({ color, size }) => <Ionicons name="business" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ChatScreen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ChangePasswordScreen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="AboutScreen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
