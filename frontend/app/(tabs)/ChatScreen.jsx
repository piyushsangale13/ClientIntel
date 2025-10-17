import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { authHeader } from "../utils/Auth";
import config from "../config";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthenticated from "../UserAuthenticated";

const API_URL = `${config.BACKEND_API_URL}/api/llm`;

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
        { prompt: input },
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
        { role: "bot", content: "Error connecting to backend" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <UserAuthenticated />
      <SafeAreaView className="flex-1 bg-white h-screen">
        <ScrollView className="flex-1 m-2 px-4 py-6">
          {messages.map((msg, idx) => (
            <View
              key={idx}
              className={`mb-3 ${msg.role === "user" ? "items-end" : "items-start"
                }`}
            >
              <Text
                className={`px-4 py-2 rounded-2xl ${msg.role === "user"
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

        <KeyboardAvoidingView className="flex-row m-1 items-center border-t border-gray-300 px-3 py-2 ">
          <TextInput
            className="flex-1 border border-gray-300 rounded-2xl px-3 py-2 mr-2"
            placeholder="Type a message..."
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
