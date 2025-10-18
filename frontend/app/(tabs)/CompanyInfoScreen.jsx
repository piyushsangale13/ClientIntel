import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthenticated from "../UserAuthenticated";
import axios from "axios";
import config from "../config";
import { authHeader } from "../utils/Auth";

const API_URL = `${config.BACKEND_API_URL}/api/llm`;

export default function CompanyInfoScreen() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState("");

  const fetchCompany = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setError("");
    setCompanyData(null);

    try {
      const headers = await authHeader();
        const res = await axios.post(
            `${API_URL}/company`,
            { company: companyName },
            { headers: { "Content-Type": "application/json", ...headers } }
        );
      setCompanyData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch company information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserAuthenticated />
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />

      <ScrollView className="px-5 pt-8 flex-1">
        <Text className="text-2xl font-bold text-center mb-6">Company Info</Text>

        <KeyboardAvoidingView>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-300 mb-4 text-gray-800"
            placeholder="Enter Company Name"
            value={companyName}
            onChangeText={setCompanyName}
          />

          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl mb-4"
            onPress={fetchCompany}
            disabled={loading}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {loading ? "Searching..." : "Search"}
            </Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" className="mt-4" />}
          {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

          {companyData && (
            <View className="bg-white rounded-2xl p-5 shadow-md mb-6">
              <Text className="text-2xl font-bold mb-2">{companyData.company}</Text>

              <Text
                className="text-blue-600 underline mb-2"
                onPress={() => Linking.openURL(companyData.officialWebsite)}
              >
                Website: {companyData.officialWebsite}
              </Text>

              <Text className="mb-1">
                <Text className="font-semibold">Domain: </Text>
                {companyData.companyDomain || "-"}
              </Text>
              <Text className="mb-1">
                <Text className="font-semibold">Employee Size: </Text>
                {companyData.employeeSize || "-"}
              </Text>
              <Text className="mb-3">
                <Text className="font-semibold">Locations: </Text>
                {companyData.companyLocations.length
                  ? companyData.companyLocations.join(", ")
                  : "-"}
              </Text>

              <Text className="font-semibold mb-1">Summary:</Text>
              <Text className="mb-3">{companyData.summary || "-"}</Text>

              <Text className="font-semibold mb-2">Top News:</Text>
              {companyData.topNews.length > 0 ? (
                companyData.topNews.map((news, idx) => (
                  <TouchableOpacity key={idx} onPress={() => Linking.openURL(news.link)}>
                    <Text className="text-blue-600 underline mb-1">{news.title}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-gray-500">No news available</Text>
              )}
            </View>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
