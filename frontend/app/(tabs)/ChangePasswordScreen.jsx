import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import config from "../config";
import { authHeader } from "../utils/Auth";
import UserAuthenticated from "../UserAuthenticated";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordOld, setShowPasswordOld] = useState(false);
    const [showPasswordNew, setShowPasswordNew] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            const headers = await authHeader();
            const res = await axios.post(
                `${config.BACKEND_API_URL}/api/auth/change_password`,
                { oldPassword, newPassword },
                { headers }
            );

            if (res.status === 200) {
                Alert.alert("Success", "Password updated successfully");
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Failed to update password");
        }
    };
    const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
    return (
        <>
            <StatusBar style="dark" />
            <UserAuthenticated />

            <ScrollView className="flex-1 bg-gray-100 px-5 pt-10">
                <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#2563EB" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800">Change Password</Text>
                </View>
                <View className="relative mb-6">
                    <TextInput
                        className="bg-white p-3 rounded-xl mb-3 border border-gray-300"
                        placeholder="Old Password"
                        placeholderTextColor={placeholderColor}
                        color="black"
                        secureTextEntry={!showPasswordOld}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TouchableOpacity
                    className="absolute right-4 top-2"
                    onPress={() => setShowPasswordOld(!showPasswordOld)}
                    >
                    <Ionicons
                        name={showPasswordOld ? "eye-off" : "eye"}
                        size={24}
                        color={placeholderColor}
                    />
                    </TouchableOpacity>
                </View>
                <View className="relative mb-6">
                    <TextInput
                        className="bg-white p-3 rounded-xl mb-3 border border-gray-300"
                        placeholder="New Password"
                        placeholderTextColor={placeholderColor}
                        color="black"
                        secureTextEntry={!showPasswordNew}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                    className="absolute right-4 top-2"
                    onPress={() => setShowPasswordNew(!showPasswordNew)}
                    >
                    <Ionicons
                        name={showPasswordNew ? "eye-off" : "eye"}
                        size={24}
                        color={placeholderColor}
                    />
                    </TouchableOpacity>
                </View>
                <View className="relative mb-6">
                    <TextInput
                        className="bg-white p-3 rounded-xl mb-6 border border-gray-300"
                        placeholder="Confirm New Password"
                        placeholderTextColor={placeholderColor}
                        color="black"
                        secureTextEntry={!showPasswordConfirm}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                    className="absolute right-4 top-2"
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                    <Ionicons
                        name={showPasswordConfirm ? "eye-off" : "eye"}
                        size={24}
                        color={placeholderColor}
                    />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleChangePassword}
                    className="bg-blue-500 py-3 rounded-xl mb-6"
                >
                    <Text className="text-center text-white text-lg font-semibold">Update Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-gray-400 py-3 rounded-xl"
                >
                    <Text className="text-center text-white text-lg font-semibold">Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}
