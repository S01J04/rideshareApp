import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'

const profile = () => {
  const { user } = useSelector(state => state.user)
  const age = useMemo(() => {
    if (!user?.dateofbirth) return "N/A";
    const birthYear = new Date(user.dateofbirth).getFullYear();
    return new Date().getFullYear() - birthYear;
  }, [user?.dateofbirth]);
     const formattedDate = useMemo(() => {
        if (!user?.createdAt) return null;
        const birthDate = new Date(user.createdAt);
        return `${birthDate.getDate()}-${birthDate.getMonth() + 1}-${birthDate.getFullYear()}`;
      }, [user?.createdAt]);
  return (
    <View className=''>
      <View className='bg-white pt-5 pl-2 flex flex-row  ' >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons className='mr-3' name="chevron-back-outline" size={27} color={"#2DBEFF"} />
        </TouchableOpacity>
      </View>
      <View className='flex  flex-col items-start gap-2 w-screen'>
        <View className='flex bg-white w-full  flex-col gap-4  px-5 py-5 items-start justify-between'>
          <View className='flex flex-row items-center'>
            <View style={{ height: 100, width: 100 }} className="rounded-full border-2  border-primary  overflow-hidden">
              <Image
                className="h-full w-ful object-cover object-top rounded-full"
                source={{ uri: user?.profilePicture }}
              />
            </View>
            <View className="flex flex-col justify-center items-start  pl-3">
              <Text className="text-secondary text-2xl font-bold"> {user.fullName}</Text>
              <Text className="text-sm text-gray-500">
              {age} y/o
              </Text>
            </View>
          </View>
          <Text className='text-tertiary text-lg font-semibold'>Experience level: Newcommer </Text>
        </View>
        <View className='flex bg-white w-full flex-col gap-4 px-5 py-5  items-start justify-between'>
          <Text className='text-secondary text-3xl font-semibold'>About {user.fullName.split(' ')[0]} </Text>
          <View className='flex  flex-col pb-5  border-b border-gray-300 w-full  gap-1'>
          {user?.preferences?.map((item, index) => (
                    <View key={index} className="text-subtext l py-1 px-5">
                        <Text>{item.category} : {item.selectedOption}</Text>
                    </View>
                ))}
            </View>
          <Text className='text-tertiary text-md '>{user.fullName.split(' ')[0]} is a non-professional memeber </Text>

        </View>
        <View className='flex bg-white w-full h-full flex-col gap-4 px-5 py-5  items-start justify-between'>
          <Text className='text-tertiary text-md '>Member since {formattedDate}</Text>

        </View>

      </View>
    </View>
  )
}

export default profile