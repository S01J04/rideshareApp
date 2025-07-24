import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Button from '@/components/button'
import { router } from 'expo-router'
import { updateProfile } from '@/redux/slices/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useProfile } from '@/redux/hooks/userHooks'

const editlastname = () => {
  const { user } = useSelector((state: any) => state?.user)
    const [lastName, setLastName] = useState(user?.lastname || user?.fullName?.split(' ')[1] || '')
    const [isSaving, setIsSaving] = useState(false)

    const dispatch = useDispatch()
    const { updateProfileFirstName, updateProfileLastName } = useProfile()

    const handleSave = async () => {
        if (!lastName.trim()) {
            Alert.alert("Error", "First name cannot be empty");
            return;
        }
        try {
            setIsSaving(true);
            console.log(lastName)
            // Update first name in backend using the hook function
            console.log("Updating first name:", lastName);
            const firstNameResponse = await updateProfileFirstName(lastName);

            console.log("First name response:", firstNameResponse?.data);

            if (firstNameResponse?.data?.success === false) {
                Alert.alert("Error", firstNameResponse.data.message);
                setIsSaving(false);
                return;
            }

          
            dispatch(
                updateProfile({
                    lastname: lastName,
                    fullName: user.fullName.split(' ')[0] + " " +lastName   
                }) as any
            );

            // Navigate back
            router.back();
        } catch (error: any) {
            console.error("Error updating name:", error);
            Alert.alert("Error", error?.message || "Failed to update name");
        } finally {
            setIsSaving(false);
        }
    }

    const clearFirstName = () => {
        setLastName('');
    }

   

    return (
        <View className='bg-white h-full'>
            <Backbtn />
            <View className='px-5 flex-1 flex justify-between'>
                <View className='space-y-5'>
                    <Text className='text-secondary text-3xl font-semibold py-5'>What's your Name</Text>
                    <View className='space-y-4'>
                        <View className='relative'>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                className='bg-gray-200 text-secondary rounded-2xl py-5 pr-12 pl-4' // add right padding so text doesn't overlap icon
                                placeholder="First Name"
                            />
                            {lastName.length > 0 && (
                                <TouchableOpacity
                                    onPress={clearFirstName}
                                    className='absolute right-4 top-1/2 -translate-y-1/2'
                                    style={{ transform: [{ translateY: -12 }] }}
                                >
                                    <Ionicons name="close-outline" size={24} color="#6f8b90" />
                                </TouchableOpacity>
                            )}
                        </View>
                       
                    </View>
                </View>

                <View className='mb-5'>
                    <Button
                        onPress={handleSave}
                        CN={{
                            bgcolor: isSaving ? "bg-gray-400" : "bg-primary",
                            color: "text-white"
                        }}
                        text={isSaving ? "Saving..." : "Save Changes"}
                    />
                </View>
            </View>
        </View>
    )
}

export default editlastname

const styles = StyleSheet.create({})