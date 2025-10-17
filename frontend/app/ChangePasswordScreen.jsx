import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import config from "./config";
import { authHeader } from "./utils/Auth";
import UserAuthenticated from "./UserAuthenticated";
import { StatusBar } from 'expo-status-bar';
export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    return (
        <>
            <StatusBar style="dark" />
            <UserAuthenticated />

            <ScrollView className="flex-1 bg-gray-100 px-5 pt-10">
                <Text className="text-2xl font-bold text-center mb-8">Change Password</Text>

                <TextInput
                    className="bg-white p-3 rounded-xl mb-3 border border-gray-300"
                    placeholder="Old Password"
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
                <TextInput
                    className="bg-white p-3 rounded-xl mb-3 border border-gray-300"
                    placeholder="New Password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput
                    className="bg-white p-3 rounded-xl mb-6 border border-gray-300"
                    placeholder="Confirm New Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

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
