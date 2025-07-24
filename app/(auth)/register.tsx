import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import Headerbackbtn from '@/components/Headerbackbtn';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Register() {
  const router=useRouter()
  return (
    <View className=" flex flex-col h-screen   p-5 text-secondary bg-white">
           <Headerbackbtn  />
      <Text className=" text-secondary   font-semibold mt-8 text-4xl ">How do you want to sign up?</Text>
      <TouchableOpacity
             onPress={() => router.navigate('/(auth)/Emailsignup')}
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
           <TouchableOpacity
             onPress={() => router.navigate('/(auth)/Emailsignup')}
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
      <View className="mt-4">
        <Text className="text-lg text-secondary font-semibold my-2">Already a member?</Text>
        <Link href="/(auth)/login" className="text-lg text-primary  mb-4">Login in</Link>

        <View  className="px-3 flex flex-col gap-3">
            <Text className="text-tertiary text-sm" style={{color:"#6f8b90"}}>
            By signing up, you accept our <Text className="text-primary">Terms and Conditions</Text> and <Text className="text-primary">Privacy Policy</Text>.
            </Text>
            <Text className=" text-sm" style={{color:"#6f8b90"}}>
            This information is collected by Ride share for the purposes of creating your account, managing your booking, using and improving our services, and for marketing purposes.
            </Text> 
            <Text className="text-tertiary text-sm" style={{color:"#6f8b90"}}>
            You have rights on your personal data and can exercise them by contacting Rideshare through our <Text className="text-primary">Contact form</Text>. You can learn more about your rights and how we use your data in our <Text className="text-primary">Privacy Policy</Text>.
            </Text>
            <Text className="text-tertiary text-sm" style={{color:"#6f8b90"}}>
            You can also change your <Text className="text-primary">Cookie Settings</Text> at any time.
            </Text>
        </View>
      </View>
         </View>
  );
}
