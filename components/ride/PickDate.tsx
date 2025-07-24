import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

interface PickDateProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  onNext: () => void
}

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const PickDate = ({ selectedDate, setSelectedDate, onNext }: PickDateProps) => {
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getToday())
    }
  }, [])

  const validateDate = (date: Date): boolean => {
    const today = getToday()
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    if (date < today) {
      Alert.alert("Invalid Date", "Please select today or a future date.")
      return false
    }
    if (date > threeMonthsFromNow) {
      Alert.alert("Invalid Date", "You can only book up to 3 months ahead.")
      return false
    }

    return true
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    
    if (selectedDate && validateDate(selectedDate)) {
      setSelectedDate(selectedDate)
    }
  }

  const handleNext = () => {
    if (validateDate(selectedDate)) {
      onNext()
    }
  }

  const formattedDate = selectedDate?.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const showDatePicker = () => {
    setShowPicker(true)
  }

  return (
    <View className="flex-1 pt-4">
      <Text className="text-4xl font-bold text-secondary mb-6 text-center">
        When are you leaving?
      </Text>

      <View className="border border-gray-300 px-5 py-3 rounded-lg mb-6">
        <Text className="text-xl font-bold text-primary text-center">{formattedDate}</Text>
      </View>

      <TouchableOpacity
        onPress={showDatePicker}
        className="flex-row items-center justify-center bg-gray-100 py-4 px-6 rounded-lg mb-6"
      >
        <Ionicons name="calendar-outline" size={24} color="#2DBEFF" style={{ marginRight: 8 }} />
        <Text className="text-lg font-semibold text-secondary text-center">Select a different date</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNext}
        className="bg-primary py-4 rounded-lg"
      >
        <Text className="text-center text-white font-bold text-lg">Next</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={getToday()}
          maximumDate={(() => {
            const maxDate = new Date()
            maxDate.setMonth(maxDate.getMonth() + 3)
            return maxDate
          })()}
        />
      )}
    </View>
  )
}

export default PickDate
