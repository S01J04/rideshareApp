import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'

interface AmenitiesProps {
  instantBooking: boolean
  setInstantBooking: (value: boolean) => void
  amenities: Record<string, boolean>
  setAmenities: (amenities: Record<string, boolean>) => void
  onNext: () => void
}

const AMENITY_OPTIONS = [
  { id: 'smoking', icon: 'ios-smoking', label: 'Smoking Allowed' },
  { id: 'pets', icon: 'paw', label: 'Pets Allowed' },
  { id: 'ac', icon: 'snow', label: 'Air Conditioning' },
  { id: 'wifi', icon: 'wifi', label: 'Wifi' },
  { id: 'music', icon: 'musical-notes', label: 'Music' },
  { id: 'food', icon: 'fast-food', label: 'Food' },
  { id: 'drinks', icon: 'cafe', label: 'Drinks' },
]

const Amenities = ({ 
  instantBooking = false, 
  setInstantBooking = () => {}, 
  amenities, 
  setAmenities, 
  onNext 
}: AmenitiesProps) => {
  const toggleAmenity = (amenityId: string) => {
    setAmenities({
      ...amenities,
      [amenityId]: !amenities[amenityId]
    })
  }

  const Checkbox = ({ isSelected }: { isSelected: boolean }) => (
    <View className="w-6 h-6 rounded-lg justify-center items-center border-[1.5px] border-primary">
      {isSelected && (
        <View className="w-4 h-4 rounded-md bg-primary" />
      )}
    </View>
  )

  return (
    <View className="flex-1 pt-4 px-4">
      {/* Instant Booking Section */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-primary mb-2">Instant Booking</Text>
        <Text className="text-sm text-gray-500 mb-4">Allow passengers to book rides instantly</Text>
        <TouchableOpacity 
          onPress={() => setInstantBooking(!instantBooking)}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-row items-center space-x-3">
            <Checkbox isSelected={instantBooking} />
            <Text className={`text-xl ${instantBooking ? 'text-primary font-semibold' : 'text-secondary'}`}>
              Instant Booking
            </Text>
          </View>
          <Ionicons 
            name="flash" 
            size={24} 
            color={instantBooking ? "#2DBEFF" : "#6f8b90"} 
          />
        </TouchableOpacity>
      </View>

      {/* Amenities Section */}
      <Text className="text-2xl font-bold text-secondary mb-6">Amenities</Text>
      <View className="space-y-3">
        {AMENITY_OPTIONS.map((amenity) => (
          <TouchableOpacity
            key={amenity.id}
            onPress={() => toggleAmenity(amenity.id)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-6 h-6 rounded-lg justify-center items-center border-[1.5px] border-primary">
                {amenities[amenity.id] && (
                  <View className="w-4 h-4 rounded-md bg-primary" />
                )}
              </View>
              <Text className={`text-xl ${amenities[amenity.id] ? 'text-primary font-semibold' : 'text-secondary'}`}>
                {amenity.label}
              </Text>
            </View>
            <Ionicons 
              name={amenity.icon} 
              size={24} 
              color={amenities[amenity.id] ? "#2DBEFF" : "#6f8b90"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-auto mb-6">
        <Button
          onPress={onNext}
          text="Continue"
          CN={{ bgcolor: "bg-primary", color: "text-white" }}
        />
      </View>
    </View>
  )
}

export default Amenities




