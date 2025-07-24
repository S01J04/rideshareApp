// app/messages.tsx (or any screen)
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import React from 'react'
import { router } from 'expo-router'
import Chat from '../(screen)/Chat'
const mockMessages = [
  {
    id: '1',
    name: 'Arjun singh',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    route: 'Gurgaon → Meerut',
    time: '09:36 A.M',
    unread: true,
    ended: false,
  },
  {
    id: '2',
    name: 'Shashi kumar',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
    route: 'Meerut → Gurgaon',
    time: '25 March, 08:03 A.M',
    unread: false,
    ended: true,
  },
  {
    id: '3',
    name: 'Akash sharma',
    image: 'https://randomuser.me/api/portraits/men/77.jpg',
    route: 'New delhi → Meerut',
    time: '06 March, 11:30 A.M',
    unread: false,
    ended: true,
  },
]

export default function inbox() {
  return (
    <View className="flex-1 bg-white pt-12">
     <Chat/>
    </View>
  )
}
