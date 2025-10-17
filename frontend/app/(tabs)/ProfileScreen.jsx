import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getTokenInfo, logout } from "../utils/Auth";
import UserAuthenticated from "../UserAuthenticated"
import { StatusBar } from 'expo-status-bar';

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

  return (
    <>
      <StatusBar style="dark" />
      <UserAuthenticated />
      <ScrollView className="flex-1 bg-gray-100 px-5 pt-10">
        <Text className="text-2xl font-bold text-center mb-8">Profile</Text>

        {user ? (
          <View className="space-y-4 mb-8">
            <Text className="text-lg">
              <Text className="font-semibold">First Name: </Text>
              {user.firstName || "-"}
            </Text>
            <Text className="text-lg">
              <Text className="font-semibold">Last Name: </Text>
              {user.lastName || "-"}
            </Text>
            <Text className="text-lg">
              <Text className="font-semibold">Email: </Text>
              {user.email}
            </Text>
          </View>
        ) : (
          <Text className="text-center text-gray-500 mb-8">Loading user info...</Text>
        )}

        <TouchableOpacity
          onPress={handleChangePassword}
          className="bg-blue-500 py-3 rounded-xl mb-6"
        >
          <Text className="text-center text-white text-lg font-semibold">Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-3 rounded-xl mb-6"
        >
          <Text className="text-center text-white text-lg font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
