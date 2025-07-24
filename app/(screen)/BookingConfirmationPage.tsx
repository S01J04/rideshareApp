import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { router } from 'expo-router';

const BookingConfirmationPage = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center px-4 py-8 mb-14 w-[97%] md:w-[95%] 2xl:w-[60%]">
      <View className="p-6 md:p-10 w-full max-w-3xl items-center">
        <FontAwesome5
          name="check-circle"
          size={80}
          color="#2563EB" // replace with your primary color
          className="mb-6 opacity-80"
        />

        <Text className="text-2xl md:text-3xl font-bold text-heading mb-4">
          Booking Confirmed!
        </Text>

        <Text className="text-subtext text-lg mb-8 text-center">
          Your ride has been successfully booked. You'll receive a notification when your driver approves the booking.
        </Text>

        <View className="flex flex-col md:flex-row gap-4 justify-center">
          <TouchableOpacity
            onPress={() => router.push('UserRideHistory')}
            className="bg-primary py-3 px-6 rounded-full"
          >
            <Text className="text-white font-semibold text-center">View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/app/(screen)/Chat')}
            className="bg-primary py-3 px-6 rounded-full"
          >
            <Text className="text-white font-semibold text-center">Chat with Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/')}
            className="flex-row items-center justify-center gap-2 border-2 border-primary rounded-full py-3 px-6"
          >
            <FontAwesome5 name="home" size={16} color="#2563EB" />
            <Text className="font-semibold text-primary">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-10 items-center">
        <Text className="text-subtext text-center">
          Need help with your booking?{' '}
          <Text
            onPress={() => nrouter.push('Support')}
            className="text-primary font-semibold underline"
          >
            Contact Support
          </Text>
        </Text>
      </View>
    </View>
  );
};
export  default BookingConfirmationPage