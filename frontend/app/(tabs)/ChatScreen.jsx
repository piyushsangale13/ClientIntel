import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { authHeader } from "../utils/Auth";
import config from "../config";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthenticated from "../UserAuthenticated";
import { Ionicons } from "@expo/vector-icons";

const API_URL = `${config.BACKEND_API_URL}/api/llm`;

export default function ChatScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const route = useRoute();
  const { companyData } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Setup Header with title & back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `Chat -> ${companyData.company}`,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 1️⃣ Initialize chat context
  useEffect(() => {
    if (companyData) {
      const introMsg = {
        role: "bot",
        content: `Here’s what I found about **${companyData.company}**:\n\n` +
          `**Website:** ${companyData.officialWebsite}\n` +
          `**Domain:** ${companyData.companyDomain || "-"}\n` +
          `**Employee Size:** ${companyData.employeeSize || "-"}\n` +
          `**Locations:** ${(companyData.companyLocations || []).join(", ") || "-"}\n\n` +
          `**Summary:** ${companyData.summary || "-"}`,
      };
      setMessages([introMsg]);
    }
  }, [companyData]);

  // 2️⃣ Send user prompt to LLM
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const headers = await authHeader();
      const res = await axios.post(
        `${API_URL}/prompt`,
        {
          prompt: `
You are a company research assistant. 
Use the following company context to answer the user's query:

${JSON.stringify(companyData, null, 2)}

User's question: ${input}
          `,
        },
        { headers: { "Content-Type": "application/json", ...headers } }
      );

      const botMessage = {
        role: "bot",
        content: res.data || "No reply",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error connecting to backend" },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  return (
    <>
      <UserAuthenticated />
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white h-screen">
        <ScrollView
          className="flex-1 m-2 px-4 py-6"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              className={`mb-3 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <Text
                className={`px-4 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.content}
              </Text>
            </View>
          ))}
          {loading && <ActivityIndicator className="mt-4" />}
        </ScrollView>

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={90}
          className="border-t border-gray-300 bg-white"
        >
          <View className="flex-row items-center px-3 py-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-2xl px-3 py-2 mr-2"
              placeholder="Type a message..."
              placeholderTextColor={placeholderColor}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-2xl"
              onPress={sendMessage}
              disabled={loading}
            >
              <Text className="text-white font-semibold">
                {loading ? "Thinking..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
