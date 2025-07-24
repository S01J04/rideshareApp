import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Headerbackbtn from "components/Headerbackbtn";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
// import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLogin } from "@/redux/hooks/userHooks";
import { zodResolver } from "../../utils/zodResolver";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";

// Define validation schema with zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Define form data type
type LoginFormData = z.infer<typeof loginSchema>;

export default function EmailLoginScreen() {
    const router = useRouter();
    const { loginUser } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    // Check if user is already logged in
    const user = useSelector((state: any) => state.user?.user);

    // If user is already logged in, redirect to tabs
    useEffect(() => {
      if (user) {
        router.replace('/(tabs)');
      }
    }, [user, router]);

    // Initialize React Hook Form with validation
    const {
      control,
      handleSubmit,
      formState: { errors }
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: 'muhammad12345sohaib@gmail.com',
        password: '21mdswe156'
      }
    });

    // Setup TanStack Query mutation
    const loginMutation = useMutation({
      mutationFn: (data: LoginFormData) => loginUser(data),
      onSuccess: () => {
        // Navigate to home screen on successful login
        router.replace('/(tabs)');
      },
      onError: (error: any) => {
        // Show error message
        Alert.alert(
          'Login Failed',
          error?.message || 'Something went wrong. Please try again.'
        );
      }
    });

    // Handle form submission
    const onSubmit = (data: LoginFormData) => {
      loginMutation.mutate(data);
    };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1  bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className=" flex flex-col  h-full justify-between p-5">
            <View>
            <Headerbackbtn onBack={() => router.back()} setcurrentstep={() => {}} currentstep={0} />
            <Text className="text-secondary font-semibold mt-8 text-4xl">
              What's your email and password?
            </Text>

            {/* Email & Password Inputs */}
            <View className="mt-5">
              {/* Email Input */}
              <View className="relative mb-4">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        className={`bg-gray-200 text-secondary rounded-2xl py-5 px-4 ${errors.email ? 'border border-red-500' : ''}`}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                      />
                      {value.length > 0 && (
                        <Ionicons
                          onPress={() => onChange("")}
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
                    </>
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 ml-2 mt-1">{errors.email.message}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        className={`bg-gray-200 text-secondary rounded-2xl py-5 px-4 ${errors.password ? 'border border-red-500' : ''}`}
                        placeholder="Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {value.length > 0 && (
                        <Ionicons
                          onPress={() => setShowPassword(!showPassword)}
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
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
                    </>
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 ml-2 mt-1">{errors.password.message}</Text>
                )}
              </View>
            </View>

            {/* Forget Password Link */}
            <View className="mt-4">
              <Link href="/(auth)/register" className="text-lg text-primary mb-4">
                Forgot password?
              </Link>
            </View>

            </View>
            {/* Login Button (Positioned at Bottom) */}
            <View className="justify-end items-center pb-8">
              {loginMutation.isPending ? (
                <View className="items-center">
                  <ActivityIndicator size="large" color="#2DBEFF" />
                  <Text className="text-secondary mt-2">Logging in...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={loginMutation.isPending}
                  style={{
                    backgroundColor: "#2DBEFF",
                    borderRadius: 50,
                    paddingVertical: 8,
                    paddingHorizontal: 30,
                    opacity: loginMutation.isPending ? 0.7 : 1,
                  }}
                  className="shadow-lg"
                >
                  <Text className="text-white text-xl font-bold">Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
