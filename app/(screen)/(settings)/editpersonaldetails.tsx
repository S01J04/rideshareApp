import { Text, View, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import Backbtn from 'components/Backbtn'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

const EditPersonalDetails = () => {
    const {user}=useSelector(state=>state?.user)
      const formattedDOB = useMemo(() => {
          if (!user?.dateofbirth) return null;
          const birthDate = new Date(user.dateofbirth);
          return `${birthDate.getDate()}-${birthDate.getMonth() + 1}-${birthDate.getFullYear()}`;
        }, [user?.dateofbirth]);
    return (
        <SafeAreaView className='bg-white h-screen'>
            <Backbtn />
            <View className='px-5 flex flex-col gap-5'>
                <Text className='text-secondary text-3xl font-semibold py-5'>Personal details</Text>
                <View className='flex flex-col border-b border-gray-300 pb-5 gap-5'>
                    {/* First Name Section */}
                    <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editfirstname")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>FirstName</Text>
                            <Text className='text-primary text-lg font-semibold'>{user?.fullName.split(' ')[0]}</Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editlastname")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>LastName</Text>
                            <Text className='text-primary text-lg font-semibold'>{user?.fullName.split(' ')[1]}</Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>

                    {/* Date of Birth Section */}
                    {user?.dateofbirth && (
                        <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editdob")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>Date of Birth</Text>
                            <Text className='text-primary text-lg font-semibold'>{formattedDOB}</Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>
                    )}

                    {/* Email Section */}
                    <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editemail")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>Email</Text>
                            <Text className='text-primary text-lg font-semibold'>{user?.email}</Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>

                    {/* Phone Section */}
                    <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editphone")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>Phone</Text>
                            <Text className='text-primary text-lg font-semibold'>{user?.phone}</Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>

                    {/* Bio Section */}
                    <TouchableOpacity 
                        onPress={() => router.push("/(screen)/(settings)/editbio")}
                        className='flex flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='text-secondary text-lg font-semibold'>Bio</Text>
                            <Text className='text-primary text-lg font-semibold' numberOfLines={1}>
                                {user?.bio}
                            </Text>
                        </View>
                        <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default EditPersonalDetails;
