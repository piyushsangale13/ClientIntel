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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://<YOUR_BACKEND_URL>/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await saveToken(data.token); // Save token
        Alert.alert("Success", "Account created!");
        navigation.replace("Home"); // Go to home after signup
      } else {
        Alert.alert("Error", data.message || "Signup failed");
      }
    } catch (err) {
      Alert.alert("Network Error", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-blue-300 px-6">
      <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
        Create Account
      </Text>

      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 text-base"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

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
        onPress={handleSignup}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Sign Up
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        className="mt-5"
      >
        <Text className="text-blue-600 text-center text-base">
          Already have an account? <Text className="font-semibold">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
