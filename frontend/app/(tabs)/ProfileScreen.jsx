import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getTokenInfo, logout } from "../utils/Auth";
import UserAuthenticated from "../UserAuthenticated";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const info = await getTokenInfo();
      if (info) setUser(info);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace("LoginScreen");
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePasswordScreen");
  };

  const handleAbout = () => {
    navigation.navigate("AboutScreen");
  };
  
  return (
    <>
      <StatusBar style="dark" />
      <UserAuthenticated />
      <ScrollView className="flex-1 bg-white px-6 pt-10">
        <View className="items-center mb-8">
          {/* Avatar */}
          <View className="w-28 h-28 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={70} color="#2563EB" />
          </View>

          {/* Name and Email */}
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {user ? `${user.firstName || ""} ${user.lastName || ""}` : "Loading..."}
          </Text>
          <Text className="text-gray-500 mb-6">{user?.email || ""}</Text>
        </View>

        {/* Options */}
        <View className="space-y-4 gap-y-4">
          <TouchableOpacity
            onPress={handleAbout}
            className="bg-gray-100 py-3 rounded-2xl border border-gray-300 shadow-sm"
          >
            <Text className="text-center text-gray-800 font-semibold text-lg">
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleChangePassword}
            className="bg-blue-600 py-3 rounded-2xl shadow-md"
          >
            <Text className="text-center text-white font-semibold text-lg">
              Change Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-3 rounded-2xl shadow-md"
          >
            <Text className="text-center text-white font-semibold text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
