import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const Backbtn = () => {
  return (
    <View className='bg-white pt-5 pl-2 flex flex-row  ' >
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons className='mr-3' name="chevron-back-outline" size={27} color={"#2DBEFF"} />
    </TouchableOpacity>
  </View>
  )
}

export default Backbtn

const styles = StyleSheet.create({})