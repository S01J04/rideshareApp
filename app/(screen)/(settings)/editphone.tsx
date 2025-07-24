import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { router } from 'expo-router'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'

const EditPhone = () => {
    const [phone, setPhone] = useState('+1234567890')

    const handlePhoneChange = (text: string) => {
        // Remove non-numeric characters except +
        const formattedText = text.replace(/[^\d+]/g, '')
        setPhone(formattedText)
    }

    const handleSave = () => {
        // Add save logic here
        router.back()
    }

    const clearPhone = () => {
        setPhone('')
    }

    return (
        <View className='bg-white h-full'>
            <Backbtn />
            <View className='px-5 flex-1 flex justify-between'>
                <View className='space-y-5'>
                    <Text className='text-secondary text-3xl font-semibold py-5'>What's your phone number</Text>
                    <View className='relative'>
                        <TextInput
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType='phone-pad'
                            className='bg-gray-200 text-secondary rounded-2xl py-5 px-4'
                            placeholder="Enter your phone number"
                        />
                        {phone.length > 0 && (
                            <TouchableOpacity 
                                onPress={clearPhone}
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
                        text="Save Changes"
                    />
                </View>
            </View>
        </View>
    )
}

export default EditPhone