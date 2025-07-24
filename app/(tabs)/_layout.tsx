import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StatusBar } from "react-native";

export default function TabsLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2DBEFF", // Active tab color
        tabBarInactiveTintColor: "#6f8b90", // Inactive tab color
        // tabBarStyle: { backgroundColor: "white", elevation: 0, shadowOpacity: 0 }, // Remove shadow
        headerShown: false, // Optional: Hide the header if needed
        tabBarActiveBackgroundColor:"transparent", // Remove tap background effect
        tabBarStyle:{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60, // Adjust height as needed
        },
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
        tabBarIconStyle:{
          backgroundColor:"transparent", // Remove icon background
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create-ride"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Your rides",
          tabBarIcon: ({ color }) => <Ionicons name="car-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Notify"
        options={{
          title: "Notify",
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
    </>
  );
}
