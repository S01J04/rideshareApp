// app/profile.tsx or any screen
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Headerbackbtn from '../../components/Headerbackbtn'
import calculateAverageAndBreakdown from '@/utils/calculateAverage'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function ProfileScreen() {
    const reviews = useSelector((state: RootState) => state?.reviews?.data || [])
    const { average, breakdown, ratingLabels } = calculateAverageAndBreakdown(reviews);

    const location = useLocalSearchParams();
    console.log("location", location);
    const driver = JSON.parse(location?.driverData as string)
    console.log("driversas", driver.driverDetails);

    if (!driver.driverDetails) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-center mt-10 text-gray-500">
                    {driver.driverDetails?.role === "passenger" ? "Passenger" : "Driver"} details not available
                </Text>
            </View>
        );
    }

    return (
        <>
            <View className='bg-white pt-5 pl-2 flex flex-row'>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons className='mr-3' name="chevron-back-outline" size={27} color={"#2DBEFF"} />
                </TouchableOpacity>
            </View>
            <ScrollView>
                <View className='flex flex-col gap-2'>
                    {/* Header Section */}
                    <View className='bg-white flex flex-col px-6 py-5 pt-4'>
                        <View className='flex flex-row'>
                            <View className="rounded-full border-2 border-primary h-20 w-20 overflow-hidden">
                                <Image
                                    className="h-full w-full rounded-full"
                                    source={{ 
                                        uri: driver.driverDetails.profilePicture || 'https://randomuser.me/api/portraits/men/2.jpg' 
                                    }}
                                />
                            </View>
                            <View className="flex flex-col justify-center pl-4">
                                <Text className="text-secondary text-2xl font-bold">
                                    {driver.driverDetails.fullName || driver.driverDetails.firstName || "Unknown Driver"}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    {driver.driverDetails.verified ? "✔ Verified" : "Unverified"}
                                </Text>
                            </View>
                        </View>

                        {/* Experience and Rating */}
                        <Text className="text-tertiary text-lg my-4 font-semibold">
                            Experience level: {driver.driverDetails.verified ? "Experienced" : "Newcomer"}
                        </Text>
                        
                        <TouchableOpacity 
                            className='flex flex-row items-center justify-between'
                            onPress={() => {
                                router.push({
                                    pathname: '/(screen)/RiderRating',
                                    params: {
                                        riderId: driver.driverDetails._id
                                    }
                                })
                            }}
                        >
                            <View className='flex flex-row gap-3'>
                                <Ionicons name='star' size={23} color='#6f8b90' />
                                <Text className="text-secondary text-lg font-semibold">
                                    {Math.floor(Number(average) || 0)}/5 - {reviews.length} ratings
                                </Text>
                            </View>
                            <Ionicons name='chevron-forward-outline' size={23} color='#6f8b90' />
                        </TouchableOpacity>

                        <View className='flex mt-4 border-b border-gray-300 pb-4 flex-row items-center justify-between'>
                            <View className='flex flex-row gap-3'>
                                <Ionicons name='car' size={23} color='#6f8b90' />
                                <Text className="text-tertiary text-lg">Good driving skills</Text>
                            </View>
                        </View>

                        {/* Verified Profile Section */}
                        <View className='mt-4'>
                            <Text className='text-2xl text-secondary font-bold'>
                                {driver.driverDetails.fullName || driver.driverDetails.firstName} {driver.driverDetails.verified ? "has a Verified Profile" : "is not Verified"}
                            </Text>
                            <View className='flex mt-4 flex-col pb-4 gap-4'>
                                <View className='flex flex-row gap-3'>
                                    <Ionicons 
                                        name={driver.driverDetails?.emailverified ? 'shield-checkmark-outline' : 'close-circle-outline'} 
                                        size={23} 
                                        color={driver.driverDetails?.emailverified ? "#2DBEFF" : "#ef4444"} 
                                    />
                                    <Text className="text-tertiary text-lg">Email ID</Text>
                                </View>
                                <View className='flex flex-row gap-3'>
                                    <Ionicons 
                                        name={driver.driverDetails?.phoneVerified ? 'shield-checkmark-outline' : 'close-circle-outline'} 
                                        size={23} 
                                        color={driver.driverDetails?.phoneVerified ? "#2DBEFF" : "#ef4444"} 
                                    />
                                    <Text className="text-tertiary text-lg">Phone</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* About Section */}
                    <View className='bg-white px-6 py-6'>
                        <Text className='text-secondary text-2xl font-bold'>
                            About {driver.driverDetails.fullName || driver.driverDetails.firstName}
                        </Text>
                        <View className='flex flex-col gap-2 py-4 border-b border-gray-300'>
                            <View className='flex flex-row gap-3'>
                                <Ionicons name='chatbox-ellipses-outline' size={23} color={"#6f8b90"} />
                                <Text className='text-tertiary font-semibold'>
                                    {driver.driverDetails.bio || "No bio available"}
                                </Text>
                            </View>
                        </View>
                        
                        <View className='mt-4'>
                            <Text className='text-tertiary text-lg'>
                                {driver.driverDetails.verified ? "Professional Member" : "Non-professional Member"}
                            </Text>
                        </View>

                        {/* Preferences Section */}
                        {driver.driverDetails.preferences && driver.driverDetails.preferences.length > 0 && (
                            <View className='mt-6'>
                                <Text className='text-lg font-semibold text-secondary'>
                                    {driver.driverDetails.role === "driver" ? "Driver Preferences" : "Passenger Preferences"}
                                </Text>
                                <View className='mt-3 space-y-2'>
                                    {driver.driverDetails.preferences
                                        .filter((pref: any) => pref.selectedOption !== "No preference selected")
                                        .map((pref: any, index: number) => (
                                            <View key={index} className='flex flex-row gap-2'>
                                                <Text className="font-semibold text-secondary">{pref.category}:</Text>
                                                <Text className="text-tertiary">{pref.selectedOption}</Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Footer Section */}
                    <View className='bg-white flex flex-col gap-3 px-6 py-6'>
                        <Text className='text-tertiary text-lg font-semibold'>
                                    {driver.driverDetails.completedRides || 0} published and completed rides
                        </Text>
                        <Text className='text-tertiary text-lg font-semibold'>
                            Member since {driver.driverDetails.createdAt ? new Date(driver.driverDetails.createdAt).getFullYear() : "2024"}
                        </Text>
                    </View>
                    
                    <View className='bg-white flex flex-col gap-3 px-6 py-2'>
                        <TouchableOpacity>
                            <Text className='text-primary font-semibold'>Report this member</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}
