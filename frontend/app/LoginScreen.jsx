import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { login } from "./utils/Auth";
import { StatusBar } from 'expo-status-bar';
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.status) {
        Alert.alert("Success", "Login successful!");
        router.replace("/(tabs)/CompanyInfoScreen");
      } else {
        Alert.alert("Error", res?.message || "Invalid credentials");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center bg-white px-6">
        <Text className="text-3xl font-bold text-center mb-8">Login</Text>

        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-6"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className={`rounded-2xl py-4 ${loading ? "bg-gray-400" : "bg-blue-600"}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Login
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/SignupScreen")} className="mt-5">
          <Text className="text-blue-600 text-center">
            Don’t have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
