import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Headerbackbtn from "@/components/Headerbackbtn";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

 const Names = ({firstName,lastName,setFirstName,setLastName, currentstep,setcurrentstep }) => {


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex flex-col h-full justify-between ">
            <View>
              <Headerbackbtn setcurrentstep={setcurrentstep} currentstep={currentstep}  />
              <Text className="text-secondary font-semibold mt-8 text-3xl">
                Whats your name?
              </Text>

              {/* First & Last Name Inputs */}
              <View className="mt-5">
                {/* First Name Input */}
                <View className="relative">
                  <TextInput
                    className="bg-gray-200 text-secondary rounded-2xl py-5 px-4"
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  {firstName.length > 0 && (
                    <Ionicons
                      onPress={() => setFirstName("")}
                      name="close-outline"
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

                {/* Last Name Input */}
                <View className="relative mt-4">
                  <TextInput
                    className="bg-gray-200 text-secondary rounded-2xl py-5 px-4"
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                  {lastName.length > 0 && lastName.length > 0 && (
                    <Ionicons
                      name="close-outline"
                      onPress={() => setLastName("")}
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

            {/* Continue Button */}
            <View className="flex justify-end items-end">
              {firstName.trim().length >= 2 && lastName.trim().length >= 2 && (
                <TouchableOpacity
                onPress={() => setcurrentstep(currentstep+1)}
                  style={{ backgroundColor: "#2DBEFF", borderRadius: 50, padding: 10 }}
                  className="shadow-lg"
                >
                  <Text className="text-white text-xl font-bold">
                    <Ionicons name="chevron-forward-outline" size={23} />
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
export  default Names