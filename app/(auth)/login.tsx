import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import Headerbackbtn from '../../components/Headerbackbtn';
import { useLogin } from '../../redux/hooks/userHooks';

// Define the form data type
type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { loginUser } = useLogin();

  // Check if user is already logged in
  const user = useSelector((state: any) => state.user?.user);

  // If user is already logged in, redirect to tabs
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  // We don't need form handling in this screen since it only has navigation buttons
  // Setup TanStack Query mutation for potential direct login
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),
    onSuccess: () => {
      // Navigate to home screen on successful login
      router.replace('/(tabs)')
    },
    onError: (error: any) => {
      // Show error message
      Alert.alert(
        'Login Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    }
  });

  return (
    <View className="flex flex-col h-screen p-5 text-secondary bg-white">
      <Headerbackbtn onBack={() => {}} setcurrentstep={() => {}} currentstep={0} />
      <Text className="text-secondary font-semibold mt-8 text-4xl">How do you want to log in?</Text>

      {/* Email login option */}
      <TouchableOpacity
        onPress={() => router.push('/(auth)/Emailloginscreen')}
        disabled={loginMutation.isPending}
      >
        <View className='flex flex-row justify-between px-1 py-7 border-b border-gray-300'>
          <View className='flex items-center flex-row'>
            <Ionicons name='mail-outline' color={"lightgray"} size={27} />
            <Text className='ml-4 text-lg text-secondary font-semibold'>
              Continue with email
            </Text>
          </View>
          <Ionicons name='chevron-forward-outline' color={"#6f8b90"} size={27} />
        </View>
      </TouchableOpacity>

      {/* Google login option */}
      <TouchableOpacity
        onPress={() => router.push('/(auth)/Emailloginscreen')}
        disabled={loginMutation.isPending}
      >
        <View className='flex flex-row justify-between px-1 py-7 border-b border-gray-300'>
          <View className='flex items-center flex-row'>
            <Ionicons name='logo-google' color={"#054752"} size={27} />
            <Text className='ml-4 text-lg text-secondary font-semibold'>
              Continue with Google
            </Text>
          </View>
          <Ionicons name='chevron-forward-outline' color={"#6f8b90"} size={27} />
        </View>
      </TouchableOpacity>

      {/* Loading indicator */}
      {loginMutation.isPending && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="large" color="#054752" />
          <Text className="mt-2 text-secondary">Logging in...</Text>
        </View>
      )}

      {/* Sign up link */}
      <View className="mt-4">
        <Text className="text-lg text-secondary font-semibold my-2">Not a member yet?</Text>
        <Link href="/(auth)/register" className="text-lg text-primary mb-4">Sign up</Link>
      </View>
    </View>
  );
}
