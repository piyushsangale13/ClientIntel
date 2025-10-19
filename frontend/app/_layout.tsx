import React from "react";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="SignupScreen" />
      <Stack.Screen name="(tabs)" />
      {/* <Stack.Screen
        name="ChatScreen"
        options={{
          title: "Chat",
          headerBackTitle: "Back",
          headerShown: true,
        }}
      /> */}
    </Stack>
  );
}
