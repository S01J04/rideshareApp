import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { router } from 'expo-router'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import { useProfile } from '@/redux/hooks/userHooks'
import { updateProfile } from '@/redux/slices/userSlice'

const EditBio = () => {
    const { user } = useSelector((state: any) => state?.user)
    const { updateProfileBio } = useProfile();
    const dispatch = useDispatch();
    const [bio, setBio] = useState(user?.bio || '')
    const [isLoading, setIsLoading] = useState(false);
    const handleSave = async () => {
        if (bio.trim().length <= 0) {
            Alert.alert("Error", "Bio cannot be empty");
            return;
        }

        if (user) {
            try {
                setIsLoading(true);

                // Send to API
                const response = await updateProfileBio(bio.trim());

                if (response?.data?.user?.bio) {
                    dispatch(updateProfile({ field: "bio", value: response.data.user.bio }) as any);
                    router.back();
                }
            } catch (error) {
                console.error("Error saving bio:", error);
                Alert.alert("Error", "Failed to save bio. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    }

    const clearBio = () => {
        setBio('')
    }

    return (
        <View className='bg-white h-full'>
            <Backbtn />
            <View className='px-5 flex-1 flex justify-between'>
                <View className='space-y-5'>
                    <Text className='text-secondary text-3xl font-semibold py-5'>About you</Text>
                    <View className='relative'>
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            className='bg-gray-200 text-secondary rounded-2xl py-5 px-4'
                            placeholder="Tell us about yourself"
                            style={{ textAlignVertical: 'top' }}
                        />
                        {bio.length > 0 && (
                            <TouchableOpacity
                                onPress={clearBio}
                                className='absolute right-4 top-5'
                            >
                                <Ionicons name="close-outline" size={24} color="#6f8b90" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View className='mb-5'>
                    <Button
                        onPress={handleSave}
                        CN={{ bgcolor: "bg-primary", color: "text-white" }}
                        text={isLoading ? "Saving..." : "Save Changes"}
                        loading={isLoading}
                    />
                </View>
            </View>
        </View>
    )
}

export default EditBio