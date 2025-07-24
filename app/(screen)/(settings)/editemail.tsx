import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Backbtn from '@/components/Backbtn'
import { router } from 'expo-router'
import Button from '@/components/button'

const EditEmail = () => {
    const [email, setEmail] = useState('muhammad.sohaib@example.com')

    const handleSave = () => {
        // Add save logic here
        router.back()
    }

    return (
        <View className='bg-white h-full'>
            <Backbtn />
            <View className='px-5 flex-1 flex justify-between'>
                <View className='space-y-5'>
                    <Text className='text-secondary text-3xl font-semibold py-5'>Whats your email</Text>
                    <View>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address'
                            autoCapitalize='none'
                            className='bg-gray-200 text-secondary rounded-2xl py-5 px-4'
                            placeholder="Enter your email"
                        />
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

export default EditEmail
