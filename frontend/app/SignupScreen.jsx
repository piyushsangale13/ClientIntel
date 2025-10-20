import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { signup } from "./utils/Auth";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(firstName, lastName, email, password);
      if (res?.status) {
        Alert.alert("Success", "Account created!");
        router.replace("/(tabs)/CompanyInfoScreen");
      } else {
        Alert.alert("Error", res?.message || "Signup failed");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center bg-white px-6">
        <Text className="text-3xl font-bold text-center mb-8">Sign Up</Text>

        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="First Name"
          placeholderTextColor={placeholderColor}
          color="black"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="Last Name"
          placeholderTextColor={placeholderColor}
          color="black"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="Email"
          placeholderTextColor={placeholderColor}
          color="black"
          value={email}
          onChangeText={setEmail}
        />
        <View className="relative mb-6">
          <TextInput
            className="border border-gray-300 rounded-2xl px-4 py-3 mb-6"
            placeholder="Password"
            placeholderTextColor={placeholderColor}
            secureTextEntry={!showPassword}
            color="black"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-2"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={placeholderColor}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`rounded-2xl py-4 ${loading ? "bg-gray-400" : "bg-blue-600"}`}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/LoginScreen")} className="mt-5">
          <Text className="text-blue-600 text-center">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
