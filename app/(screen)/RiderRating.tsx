import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axiosInstance from '@/redux/axiosInstance';

const options = [
  "Excellent", "Good", "Okay", "Disappointing", "Very Disappointing"
];

export default function RiderRatingScreen() {
  const { userId, rideId, reviewerRole } = useLocalSearchParams<{
    userId: string;
    rideId: string;
    reviewerRole: string;
  }>();

  const reviewerId = useSelector((state: any) => state?.user?.user?._id);
  const [rating, setRating] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !reviewText) {
      Toast.show({
        type: 'error',
        text1: 'Please complete the form',
        text2: 'Select a rating and write your review',
      });
      return;
    }

    try {
      setSubmitting(true);
      // Replace this with your actual POST request
      // Example:
      
      const response = await axiosInstance.post('/reviews', {
        rideId, reviewerId, revieweeId: userId, reviewerRole, rating, reviewText,
      });
      

      // Mock success:
      Toast.show({
        type: 'success',
        text1: 'Review submitted successfully',
      });

      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Submission Error',
        text2: message,
      });
      setTimeout(() => router.back(), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId || !rideId || !reviewerRole) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 font-semibold">Missing review information.</Text>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <ScrollView
              className="flex-1 p-6"
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-3xl font-semibold text-center text-teal-900 mb-8">
                Ratings
              </Text>

              {/* Summary */}
              <View className="p-6 bg-gray-50 rounded-lg mb-6">
                <View className="flex flex-col gap-5 items-start">
                  <View>
                    <Text className="text-5xl font-bold text-teal-900">5/5</Text>
                    <Text className="text-sm text-gray-500">1 rating</Text>
                  </View>

                  <View className="border border-gray-200 w-full my-2" />
                  <View className="w-full flex flex-col gap-3 text-gray-500">
                    {options.map((label, index) => (
                      <View key={index} className="flex flex-row justify-between">
                        <Text className="text-sm">{label}</Text>
                        <Text className="text-sm">0</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Review Form */}
              <View className="p-6 bg-white space-y-5">
                <View>
                  <Text className="font-semibold text-teal-900">Rate your experience:</Text>
                  <View className="flex flex-row flex-wrap mt-3 gap-3">
                    {options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setRating(option)}
                        className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                          rating === option ? 'bg-teal-500 border-teal-600' : 'border-gray-300'
                        }`}
                      >
                        <Text className={`text-sm ${
                          rating === option ? 'text-white' : 'text-gray-700'
                        }`}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="font-semibold text-teal-900 mb-1">Write your review:</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-sm text-gray-700"
                    placeholder="Share your thoughts here..."
                    multiline
                    numberOfLines={5}
                    value={reviewText}
                    onChangeText={setReviewText}
                    textAlignVertical="top"
                  />
                </View>

                <Text className="text-xs text-gray-500">Jun 2024</Text>
              </View>

              <View className="border w-full border-gray-200 my-6" />
            </ScrollView>

            {/* Submit Button */}
            <View className="absolute bottom-6 right-6 left-6">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="bg-teal-500 px-6 py-3 rounded-lg flex-row justify-center items-center"
              >
                <Text className="text-white font-bold mr-2">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Show Toasts */}
      <Toast />
    </>
  );
}
