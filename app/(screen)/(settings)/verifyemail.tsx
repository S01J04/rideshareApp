import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Headerbackbtn from '@/components/Headerbackbtn';
import axiosInstance from '@/redux/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Toast from 'react-native-toast-message';
import { updateProfile } from '@/redux/slices/userSlice';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if text entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the complete 6-digit OTP.',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('otpString', typeof otpString)
      const response = await axiosInstance.post('/users/verifyphoneotp', {
        otp: Number(otpString),
        email: user?.email // This should come from props or state
      });

      console.log('OTP verification successful:', response.data);

      dispatch(updateProfile({
        field: "emailverified",
        value: true
      }));
      Toast.show({
        type: 'success',
        text1: 'OTP verified successfully',
        text2: 'Your email has been successfully verified.',
      });
      router.push('/(tabs)/profile')
    } catch (error) {
      console.error('OTP verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'OTP verification failed',
        text2: 'Invalid OTP. Please check and try again.',
      }); 
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const response = await axiosInstance.post('/users/resend_otp', {
        email: user?.email // This should come from props or state
      });

      console.log('OTP resent successfully:', response.data);
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      Toast.show({
        type: 'success',
        text1: 'OTP resent successfully',
        text2: 'A new OTP has been sent to your email.',
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to resend OTP',
        text2: 'Please try again.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-col h-full justify-between p-5">
          <View>
            <Headerbackbtn />
            <Text className="text-secondary font-semibold mt-8 text-3xl">
              Verify your email
            </Text>

            <Text className="text-tertiary text-lg mt-4">
              We've sent a 6-digit verification code to
            </Text>
            <Text className="text-primary font-semibold text-lg">
              muhammad12345sohaib@gmail.com
            </Text>

            {/* OTP Input Fields */}
            <View className="mt-8">
              <Text className="text-secondary font-semibold text-lg mb-4">
                Enter verification code
              </Text>

              <View className="flex-row justify-between">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    className="w-12 h-12 bg-gray-200 text-center text-xl font-bold text-secondary rounded-xl border-2 border-gray-300"
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Resend OTP Section */}
            <View className="mt-8 items-center">
              <Text className="text-tertiary text-center">
                Didn't receive the code?
              </Text>

              {canResend ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading}
                  className="mt-2"
                >
                  {resendLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#2DBEFF" />
                      <Text className="text-primary font-semibold ml-2">
                        Sending...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-primary font-semibold text-lg">
                      Resend OTP
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Text className="text-tertiary mt-2">
                  Resend available in {timer}s
                </Text>
              )}
            </View>
          </View>

          {/* Verify Button */}
          <View className="flex justify-end items-end mb-8">
            {isOtpComplete && !loading && (
              <TouchableOpacity
                onPress={handleVerifyOtp}
                style={{ backgroundColor: '#2DBEFF', borderRadius: 50, padding: 15 }}
                className="shadow-lg"
              >
                <Text className="text-white text-xl font-bold">
                  <Ionicons name="checkmark-outline" size={25} />
                </Text>
              </TouchableOpacity>
            )}
            {loading && (
              <View style={{ backgroundColor: '#2DBEFF', borderRadius: 50, padding: 15 }}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmail; 