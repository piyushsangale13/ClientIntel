import React from "react";
import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import UserAuthenticated from "../UserAuthenticated";

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar style="dark" />
      <UserAuthenticated />
      <ScrollView className="flex-1 bg-white px-6 pt-10">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">About</Text>
        </View>

        {/* App Info */}
        <View className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <Text className="text-lg text-gray-700 mb-3">
            <Text className="font-semibold">App Name:</Text> Client Intel
          </Text>
          <Text className="text-lg text-gray-700 mb-3">
            <Text className="font-semibold">Version:</Text> 1.0.1
          </Text>
          <Text className="text-lg text-gray-700 mb-3">
            <Text className="font-semibold">Developer:</Text> Developed during Online internship @Otsuka Shokai
          </Text>
          <Text className="text-gray-600 leading-6 mt-4">
            Client Intel helps sales professionals access detailed company
            insights using LLM-powered research and real-time data analysis.
            Stay informed, understand clients better, and build stronger
            relationships through data-driven intelligence.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
