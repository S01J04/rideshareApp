import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import Button from 'components/button'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'

interface PickTimeProps {
  selectedTime: Date
  setSelectedTime: (time: Date) => void
  onNext: () => void
}

const PickTime = ({ selectedTime, setSelectedTime, onNext }: PickTimeProps) => {
  const [showPicker, setShowPicker] = useState(false)

  // Set initial time if not set
  useEffect(() => {
    if (!selectedTime) {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 30) // Set default time to 30 minutes from now
      setSelectedTime(now)
    }
  }, [])

  const validateAndSetTime = (newTime: Date) => {
    const now = new Date()
    if (newTime < now) {
      Alert.alert(
        "Invalid Time",
        "Please select a future time"
      )
      return false
    }
    return true
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    
    if (selectedTime && validateAndSetTime(selectedTime)) {
      setSelectedTime(selectedTime)
    }
  }

  const handleNext = () => {
    if (validateAndSetTime(selectedTime)) {
      onNext()
    }
  }

  const formattedTime = selectedTime?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const showTimePicker = () => {
    setShowPicker(true)
  }

  return (
    <View className="flex-1 pt-4">
      <Text className="text-3xl font-bold text-secondary mb-6 text-center">
        What time will you depart?
      </Text>

      <View className="flex-1">
        <View className="border border-gray-300 px-5 py-3 rounded-lg mb-4">
          <Text className="text-xl font-bold text-primary text-center">
            {formattedTime}
          </Text>
        </View>

        <TouchableOpacity
          onPress={showTimePicker}
          className="flex-row items-center justify-center bg-gray-100 py-4 px-6 rounded-lg mb-6"
        >
          <Ionicons name="time-outline" size={24} color="#2DBEFF" style={{ marginRight: 8 }} />
          <Text className="text-lg font-semibold text-secondary text-center">Select a different time</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6 w-1/2 mx-auto">
        <Button
          onPress={handleNext}
          text="Continue"
          CN={{ bgcolor: "bg-primary", color: "text-white" }}
        />
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          minuteInterval={30}
        />
      )}
    </View>
  )
}

export default PickTime


