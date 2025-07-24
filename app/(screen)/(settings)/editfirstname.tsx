import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { router } from 'expo-router'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '@/redux/slices/userSlice'
import { useProfile } from '@/redux/hooks/userHooks'

const EditFirstName = () => {
    const { user } = useSelector((state: any) => state?.user)
    const [firstName, setFirstName] = useState(user?.firstname || user?.fullName?.split(' ')[0] || '')
    const [isSaving, setIsSaving] = useState(false)

    const dispatch = useDispatch()
    const { updateProfileFirstName, updateProfileLastName } = useProfile()

    const handleSave = async () => {
        if (!firstName.trim()) {
            Alert.alert("Error", "First name cannot be empty");
            return;
        }

     

        try {
            setIsSaving(true);
            console.log(firstName)
            // Update first name in backend using the hook function
            console.log("Updating first name:", firstName);
            const firstNameResponse = await updateProfileFirstName(firstName);

            console.log("First name response:", firstNameResponse?.data);

            if (firstNameResponse?.data?.success === false) {
                Alert.alert("Error", firstNameResponse.data.message);
                setIsSaving(false);
                return;
            }

          
            dispatch(
                updateProfile({
                    firstname: firstName,
                    fullName: firstName + " " + user.fullName.split(' ')[1]
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
        setFirstName('');
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
                                value={firstName}
                                onChangeText={setFirstName}
                                className='bg-gray-200 text-secondary rounded-2xl py-5 pr-12 pl-4' // add right padding so text doesn't overlap icon
                                placeholder="First Name"
                            />
                            {firstName.length > 0 && (
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

export default EditFirstName

