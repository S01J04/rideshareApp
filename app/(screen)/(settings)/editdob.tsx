import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useMemo, useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { router } from 'expo-router'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import { useProfile } from '@/redux/hooks/userHooks'
import { updateProfile } from '@/redux/slices/userSlice'

const EditDOB = () => {
    const { user } = useSelector((state: any) => state?.user)
    const { updateProfileDateOfBirth } = useProfile();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    // Format the existing DOB from the user object if it exists
    const formattedDOB = useMemo(() => {
        if (!user?.dateofbirth) return '';
        const birthDate = new Date(user.dateofbirth);
        return `${String(birthDate.getDate()).padStart(2, '0')}/${String(birthDate.getMonth() + 1).padStart(2, '0')}/${birthDate.getFullYear()}`;
    }, [user?.dateofbirth]);

    const [dob, setDob] = useState(formattedDOB || '')
    // Handle DOB input changes with proper formatting
    const handleDOBChange = (text: string) => {
        // Remove non-numeric characters
        const formattedText = text.replace(/[^0-9]/g, "").slice(0, 8)

        // Format as DD/MM/YYYY
        let formattedDate = formattedText
        if (formattedText.length >= 2) {
            formattedDate = `${formattedText.slice(0, 2)}/${formattedText.slice(2)}`
        }
        if (formattedText.length >= 4) {
            formattedDate = `${formattedDate.slice(0, 5)}/${formattedDate.slice(5)}`
        }

        setDob(formattedDate)
    }

    // Validate the date format and values
    const isValidDate = (dateString: string) => {
        // Check if format is DD/MM/YYYY
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return false;
        }

        const [day, month, year] = dateString.split('/').map(Number);

        // Check if date values are valid
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        // Check days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) return false;

        // Check if date is not in the future
        const currentDate = new Date();
        const inputDate = new Date(year, month - 1, day);
        if (inputDate > currentDate) return false;

        return true;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for API
    const formatDateForAPI = (dateString: string) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }


    const handleSave = async () => {
        if (dob.length <= 0) {
            Alert.alert("Error", "Date of birth cannot be empty");
            return;
        }

        if (!isValidDate(dob)) {
            Alert.alert("Error", "Please enter a valid date in DD/MM/YYYY format");
            return;
        }

        if (user) {
            try {
                setIsLoading(true);

                // Format date for API
                const apiFormattedDate = formatDateForAPI(dob);

                // Send to API
                const response = await updateProfileDateOfBirth(apiFormattedDate);

                if (response?.data?.user?.dateofbirth) {
                    const dateofbirth = new Date(response.data.user.dateofbirth);
                    dispatch(updateProfile({ field: "dateofbirth", value: dateofbirth }) as any);
                    router.back();
                }
            } catch (error) {
                console.error("Error saving date of birth:", error);
                Alert.alert("Error", "Failed to save date of birth. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    }

    const clearDOB = () => {
        setDob('')
    }

    return (
        <View className='bg-white h-full'>
            <Backbtn />
            <View className='px-5 flex-1 flex justify-between'>
                <View className='space-y-5'>
                    <Text className='text-secondary text-3xl font-semibold'>Whats your Date of Birth</Text>
                    <View className='relative'>
                        <TextInput
                            value={dob}
                            onChangeText={handleDOBChange}
                            placeholder='DD/MM/YYYY'
                            keyboardType='numeric'
                            className='bg-gray-200 text-secondary rounded-2xl py-5 px-4'
                        />
                        {dob.length > 0 && (
                            <TouchableOpacity
                                onPress={clearDOB}
                                className='absolute right-4 top-1/2 -translate-y-1/2'
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

export default EditDOB



