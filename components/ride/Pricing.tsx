import { View, Text, TextInput } from 'react-native'
import React from 'react'
import Button from '@/components/button'
import { Ionicons } from '@expo/vector-icons'
import { RideType } from '@/types/ride'

interface PricingProps {
  rideType: RideType
  pricePerSeat: number
  setPricePerSeat: (price: number) => void
  priceCargoCapacity?: number
  setPriceCargoCapacity?: (price: number) => void
  onNext: () => void
}

const Pricing = ({ 
  rideType,
  pricePerSeat,
  setPricePerSeat,
  priceCargoCapacity,
  setPriceCargoCapacity,
  onNext 
}: PricingProps) => {
  const handlePriceChange = (text: string, setPriceFn: (price: number) => void) => {
    // Only allow numbers and one decimal point
    const formattedPrice = text.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const decimalCount = (formattedPrice.match(/\./g) || []).length
    if (decimalCount > 1) return

    setPriceFn(parseFloat(formattedPrice) || 0)
  }

  const suggestedPrices = [15, 20, 25, 30]

  return (
    <View className="flex-1 pt-4">
      {(rideType === "passenger" || rideType === "mixed") && (
        <View className="mb-8">
          <Text className="text-2xl font-bold text-secondary mb-6">
            Set your price per seat
          </Text>

          <View className="space-y-6">
            <View className="bg-gray-100 rounded-xl p-4">
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-secondary">$</Text>
                <TextInput
                  value={pricePerSeat.toString()}
                  onChangeText={(text) => handlePriceChange(text, setPricePerSeat)}
                  keyboardType="decimal-pad"
                  className="flex-1 text-3xl font-bold text-secondary ml-2"
                  placeholder="0.00"
                />
              </View>
            </View>

            <View>
              <Text className="text-tertiary mb-3">Suggested prices</Text>
              <View className="flex-row flex-wrap gap-2">
                {suggestedPrices.map((suggestedPrice) => (
                  <Button
                    key={suggestedPrice}
                    onPress={() => setPricePerSeat(suggestedPrice)}
                    text={`$${suggestedPrice}`}
                    CN={{
                      bgcolor: pricePerSeat === suggestedPrice ? "bg-primary" : "bg-gray-100",
                      color: pricePerSeat === suggestedPrice ? "text-white" : "text-tertiary"
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {(rideType === "cargo" || rideType === "mixed") && setPriceCargoCapacity && (
        <View className="mb-8">
          <Text className="text-2xl font-bold text-secondary mb-6">
            Set your price per cubic meter
          </Text>

          <View className="space-y-6">
            <View className="bg-gray-100 rounded-xl p-4">
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-secondary">$</Text>
                <TextInput
                  value={priceCargoCapacity?.toString()}
                  onChangeText={(text) => handlePriceChange(text, setPriceCargoCapacity)}
                  keyboardType="decimal-pad"
                  className="flex-1 text-3xl font-bold text-secondary ml-2"
                  placeholder="0.00"
                />
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="bg-primary/10 rounded-xl p-4 mb-8">
        <View className="flex-row items-center">
          <Ionicons name="information-circle-outline" size={24} color="#2DBEFF" />
          <Text className="text-primary ml-2 flex-1">
            Set a competitive price to attract more {rideType === "cargo" ? "shipments" : "passengers"}
          </Text>
        </View>
      </View>

      <View className="mt-auto mb-6">
        <Button
          onPress={onNext}
          text="Continue"
          CN={{ 
            bgcolor: (pricePerSeat > 0 || (priceCargoCapacity && priceCargoCapacity > 0)) 
              ? "bg-primary" 
              : "bg-gray-300", 
            color: "text-white" 
          }}
          disabled={!(pricePerSeat > 0 || (priceCargoCapacity && priceCargoCapacity > 0))}
        />
      </View>
    </View>
  )
}

export default Pricing
