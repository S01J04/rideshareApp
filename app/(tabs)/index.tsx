import { Image, Text, View, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '@/components/Search';
import { initializeSocket } from '@/redux/actions/socketAction';
import { useDispatch } from 'react-redux';

const Home = () => {
  const router = useRouter();
  const dispatch=useDispatch()
    useEffect(() => {
        dispatch(initializeSocket());
    }, [dispatch]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Hero Section */}
        <View className="relative h-[70%]">
          <View className="flex-1 items-center justify-end pb-4">
            <Image
              source={require('../../assets/carpool.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="absolute inset-0 bg-black/30" />
          <Text className="absolute text-white text-4xl font-bold text-center mt-10 px-4">
            Your picks of rides at the lowest Prices
          </Text>
        </View>

        {/* Form Section */}
        <Search handlesearch={(searchData) => {
          // Navigate to search page with search data
          router.push({
            pathname: '/(screen)/SearchRides',
            params: {
              searchData: JSON.stringify(searchData)
            }
          });
        }} />
      </View>
    </SafeAreaView>
  );
}

export default Home;