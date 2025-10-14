import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { saveToken } from "./utils/Auth"; // Adjust path as needed

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://<YOUR_BACKEND_URL>/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await saveToken(data.token); // Save JWT securely
        Alert.alert("Welcome!", "Login successful!");
        navigation.replace("Home"); // Replace with your home screen
      } else {
        Alert.alert("Error", data.message || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Network Error", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
        Welcome Back
      </Text>

      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 text-base"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3 mb-6 text-base"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className={`rounded-2xl py-4 ${loading ? "bg-gray-400" : "bg-blue-600"}`}
        disabled={loading}
        onPress={handleLogin}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")} className="mt-5">
        <Text className="text-blue-600 text-center text-base">
          Don’t have an account? <Text className="font-semibold">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
