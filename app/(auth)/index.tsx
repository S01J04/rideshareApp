import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Index = () => {
    const router = useRouter();

    return (
        <View className="h-screen w-screen bg-white flex flex-col">
            {/* Image Section */}
            <View className="flex-1 flex justify-center items-center">
                <Image
                    source={require('../../assets/carpool.png')}
                    className="w-full h-[70vh]"
                    resizeMode="cover"
                    style={{ backgroundColor: 'transparent' }}
                />
            </View>

            {/* Buttons Section */}
            <View className="flex-1 flex flex-col justify-center items-center px-4 space-y-4">
                <Text className="text-3xl text-secondary font-bold text-center mb-4">
                    Your pick of rides at low prices
                </Text>
                <TouchableOpacity 
                    className=" w-full bg-primary py-3 rounded-full" 
                    onPress={() => router.navigate("/register")}
                >
                    <Text className="text-white text-center font-semibold">Register</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.navigate("/login")}
                    className="w-full  py-3 border-primary border rounded-full"
                >
                    <Text className="text-center text-primary  text-lg font-bold">
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Index;
