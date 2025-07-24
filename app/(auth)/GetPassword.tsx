import React, { useState } from "react";
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Platform, ScrollView, Keyboard, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Headerbackbtn from "@/components/Headerbackbtn";

const GetPassword = ({password, setPassword, currentstep, setcurrentstep, onRegister, loading}) => {
  const [showpassword,setshowpassword]=useState(false)

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex flex-col h-full justify-between ">
            <View>
              <Headerbackbtn setcurrentstep={setcurrentstep} currentstep={currentstep} />
              <Text className="text-secondary font-semibold mt-8 text-3xl">Define your password</Text>
              <Text>
                <Text className="text-tertiary  test-sm mt-7 mb-4 px-3 ">
                    Your password must have at least 6 characters.
                </Text>
              </Text>

              {/* Password Input */}
              <View className="mt-5">
                <View className="relative">
                <TextInput
                    className="bg-gray-200 text-secondary rounded-2xl py-5 px-4"
                    placeholder="Password"
                 value={password}
                 onChangeText={(text) => setPassword(text)}
                 secureTextEntry={!showpassword}
                 autoCapitalize="none"
                 autoCorrect={false}
                />
                {password.length > 0 && (
                    <Ionicons
                    onPress={() => setshowpassword(!showpassword)}
                    name={showpassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={"#6f8b90"}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: [{ translateY: -12 }],
                    }}
                  />
                )}
              </View>
              </View>
            </View>

            {/* Register Button */}
            <View className="flex justify-end items-end mt-8">
              {password.length >= 6 && !loading && (
                <TouchableOpacity
                onPress={onRegister}
                  style={{ backgroundColor: "#2DBEFF", borderRadius: 50, padding: 10 }}
                  className="shadow-lg"
                >
                  <Text className="text-white text-xl font-bold">
                    <Ionicons name="checkmark-outline" size={23} />
                  </Text>
                </TouchableOpacity>
              )}
              {loading && (
                <View style={{ backgroundColor: "#2DBEFF", borderRadius: 50, padding: 10 }}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GetPassword;
