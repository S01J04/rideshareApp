import { View, Text, Alert } from 'react-native';
import { RideType } from '@/types/ride';
import Button from '@/components/button';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react'

interface CapacityProps {
  rideType: RideType;
  seats: number;
  setSeats: (seats: number) => void;
  cargoCapacity: number;
  setCargoCapacity: (capacity: number) => void;
  onNext: () => void;
}

const Capacity: React.FC<CapacityProps> = ({
  rideType,
  seats,
  setSeats,
  cargoCapacity,
  setCargoCapacity,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);

  const validateCapacity = (): boolean => {
    if (rideType === "passenger" && seats < 1) {
      setError("You must take at least 1 passenger.");
      Alert.alert("Error", "You must take at least 1 passenger.");
      return false;
    }

    if (rideType === "cargo" && cargoCapacity < 5) {
      setError("Cargo capacity must be at least 5 cubic meters.");
      Alert.alert("Error", "Cargo capacity must be at least 5 cubic meters.");
      return false;
    }

    if (rideType === "mixed" && seats < 1 && cargoCapacity < 5) {
      setError("At least 1 passenger or a minimum of 5 cubic meters of cargo capacity is required.");
      Alert.alert("Error", "At least 1 passenger or a minimum of 5 cubic meters of cargo capacity is required.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateCapacity()) {
      onNext();
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center text-secondary mb-6">
        Set Capacity
      </Text>

      {(rideType === "passenger" || rideType === "mixed") && (
        <View className="mb-8">
          <Text className="text-lg font-semibold text-tertiary mb-4 text-center">
            Number of Passengers
          </Text>
          
          <View className="flex-row items-center justify-center space-x-6">
            <TouchableOpacity
              onPress={() => setSeats(Math.max(1, seats - 1))}
              className="w-12 h-12 rounded-full border-2 border-primary items-center justify-center"
            >
              <Ionicons name="remove" size={42} color="#2DBEFF" />
            </TouchableOpacity>

            <View className="w-20 h-20 rounded-full items-center justify-center">
              <Text className="text-4xl font-bold text-primary">{seats}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setSeats(Math.min(6, seats + 1))}
              className="w-12 h-12 rounded-full border-2 border-primary items-center justify-center"
            >
              <Ionicons name="add" size={42} color="#2DBEFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(rideType === "cargo" || rideType === "mixed") && (
        <View className="mb-8">
          <Text className="text-lg font-semibold text-tertiary mb-4 text-center">
            Cargo space (in cubic meters)
          </Text>
          
          <View className="flex-row items-center justify-center space-x-6">
            <TouchableOpacity
              onPress={() => setCargoCapacity(Math.max(5, cargoCapacity - 5))}
              className="w-12 h-12 rounded-full border-2 border-primary items-center justify-center"
            >
              <Ionicons name="remove" size={42} color="#2DBEFF" />
            </TouchableOpacity>

            <View className="w-28 h-20 rounded-full items-center justify-center">
              <Text className="text-4xl font-bold px-5 text-primary">{cargoCapacity}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setCargoCapacity(Math.min(100, cargoCapacity + 5))}
              className="w-12 h-12 rounded-full border-2 border-primary items-center justify-center"
            >
              <Ionicons name="add" size={42} color="#2DBEFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error ? (
        <Text className="text-red-500 text-center mt-4">{error}</Text>
      ) : null}

      <View className="mt-auto mb-6">
        <Button
          onPress={handleNext}
          text="Continue"
          CN={{ bgcolor: "bg-primary", color: "text-white" }}
        />
      </View>
    </View>
  );
};

export default Capacity;


