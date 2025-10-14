import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getUserFromToken, deleteToken } from '../utils/Auth'; // Adjust the path as needed

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userInfo = await getUserFromToken();
      if (!userInfo) {
        Alert.alert("Session expired", "Please log in again.");
        navigation.replace('LoginScreen');
        return;
      }
      setUser(userInfo);
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await deleteToken();
    navigation.replace('LoginScreen');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-center mb-6">Profile</Text>

      <Text className="text-lg mb-3"><Text className="font-semibold">Name:</Text> {user.name || user.firstName || 'N/A'}</Text>
      <Text className="text-lg mb-3"><Text className="font-semibold">Email:</Text> {user.email}</Text>

      <TouchableOpacity
        className="mt-8 bg-red-500 py-3 rounded-xl"
        onPress={handleLogout}
      >
        <Text className="text-white text-center text-lg font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
