import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'

interface RideTypeProps {
  rideType: 'passenger' | 'cargo' | 'mixed'
  setRideType: (type: 'passenger' | 'cargo' | 'mixed') => void
  onNext: () => void
}

const RideType = ({ rideType, setRideType, onNext }: RideTypeProps) => {
  return (
    <View className="flex-1 pt-4">
      <Text className="text-2xl font-bold text-secondary mb-6 text-center">
        What type of ride are you offering?
      </Text>

      <View className="space-y-4">
        {/* Passenger Option */}
        <TouchableOpacity
          onPress={() => setRideType('passenger')}
          className={`p-4 rounded-xl border-2 ${
            rideType === 'passenger' ? 'border-primary bg-primary/10' : 'border-gray-200'
          }`}
        >
          <View className="items-center space-y-2">
            <Ionicons 
              name="car-outline" 
              size={32} 
              color={rideType === 'passenger' ? "#2DBEFF" : "#6f8b90"} 
            />
            <Text className={`text-lg font-semibold ${
              rideType === 'passenger' ? 'text-primary' : 'text-secondary'
            }`}>
              Passenger
            </Text>
            <Text className="text-sm text-tertiary text-center">
              Offer rides to passengers
            </Text>
          </View>
        </TouchableOpacity>

        {/* Cargo Option */}
        <TouchableOpacity
          onPress={() => setRideType('cargo')}
          className={`p-4 rounded-xl border-2 ${
            rideType === 'cargo' ? 'border-primary bg-primary/10' : 'border-gray-200'
          }`}
        >
          <View className="items-center space-y-2">
            <Ionicons 
              name="cube-outline" 
              size={32} 
              color={rideType === 'cargo' ? "#2DBEFF" : "#6f8b90"} 
            />
            <Text className={`text-lg font-semibold ${
              rideType === 'cargo' ? 'text-primary' : 'text-secondary'
            }`}>
              Cargo
            </Text>
            <Text className="text-sm text-tertiary text-center">
              Transport goods and items
            </Text>
          </View>
        </TouchableOpacity>

        {/* Mixed Option */}
        <TouchableOpacity
          onPress={() => setRideType('mixed')}
          className={`p-4 rounded-xl border-2 ${
            rideType === 'mixed' ? 'border-primary bg-primary/10' : 'border-gray-200'
          }`}
        >
          <View className="items-center space-y-2">
            <Ionicons 
              name="car-sport-outline" 
              size={32} 
              color={rideType === 'mixed' ? "#2DBEFF" : "#6f8b90"} 
            />
            <Text className={`text-lg font-semibold ${
              rideType === 'mixed' ? 'text-primary' : 'text-secondary'
            }`}>
              Mixed
            </Text>
            <Text className="text-sm text-tertiary text-center">
              Offer both
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mt-auto mb-6">
        <Button
          onPress={onNext}
          text="Continue"
          CN={{ bgcolor: rideType ? "bg-primary" : "bg-gray-300", color: "text-white" }}
          disabled={!rideType}
        />
      </View>
    </View>
  )
}

export default RideType

