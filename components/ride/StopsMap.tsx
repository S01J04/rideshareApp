import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '@/components/button';

interface StopType {
  cityName: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: string;
  duration?: string;
  address?: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

interface StopsMapProps {
  fromLocation: string;
  toLocation: string;
  selectedRoute: any;
  stops: StopType[];
  addStop: (stops: any[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
}

const StopsMap: React.FC<StopsMapProps> = ({
  stops,
  addStop,
  nextStep,
  prevStep,
}) => {
  // Log props for debugging
  console.log("StopsMap Props:", {
    stopsCount: stops?.length || 0,
  });

  const [selectedStops, setSelectedStops] = useState<StopType[]>([]);

  const handleStopSelection = (stop: StopType, isSelected: boolean) => {
    console.log(`${isSelected ? 'Adding' : 'Removing'} stop:`, stop.cityName);

    const updatedStops = isSelected
      ? [...selectedStops, {
          ...stop,
          coordinates: [stop.location.lng, stop.location.lat] as [number, number],
        }]
      : selectedStops.filter(
          (s) =>
            s.location.lat !== stop.location.lat ||
            s.location.lng !== stop.location.lng
        );

    setSelectedStops(updatedStops as StopType[]);
    console.log("Selected stops:", updatedStops.length);
  };

  const handleNextStep = () => {
    console.log("Saving selected stops:", selectedStops.length);

    const updatedStops = selectedStops.map(item => ({
      ...item,
      cityName: item.cityName + " Pakistan",
      coordinates: [item.location.lng, item.location.lat] as [number, number], // Ensure coordinates are [longitude, latitude]
    }));

    console.log("Formatted stops for next step:", updatedStops);
    addStop(updatedStops);
    nextStep();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <View className="px-4 py-3 border-b border-gray-200">
          <Text className="text-3xl font-semibold text-center text-secondary">
            Select Stops
          </Text>
          <Text className="text-center text-gray-600 mt-2 mb-2">
            Choose which stops to include on your route:
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100, // Space for button + tab bar
          }}
          keyboardShouldPersistTaps="handled"
        >
          {stops.map((stop, index) => {
            const isSelected = selectedStops.some(
              s =>
                s.location.lat === stop.location.lat &&
                s.location.lng === stop.location.lng
            );

            return (
              <TouchableOpacity
                key={`${stop.cityName}-${index}`}
                onPress={() => handleStopSelection(stop, !isSelected)}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ backgroundColor: isSelected ? 'rgba(45, 190, 255, 0.05)' : 'transparent' }}
              >
                <View className="flex-row items-center">
                  <View className={`w-5 h-5 rounded-lg border-2 ${isSelected ? 'bg-primary border-primary' : 'border-primary'} mr-3`}>
                    {isSelected && (
                      <View className="w-2 h-2 bg-primary rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </View>
                  <Text className="text-lg font-semibold text-secondary">
                    {stop.cityName}
                  </Text>
                </View>
                {stop.distance && (
                  <Text className="text-sm text-gray-500">
                    {stop.distance}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Button inside scrollable area, always accessible */}
          <View className="mt-6 w-full  px-4">
            {/* <Button
              onPress={prevStep}
              text="Back"
              CN={{
                bgcolor: "bg-gray-400",
                color: "text-white"
              }}
            /> */}
            <Button
              onPress={handleNextStep}
              text="Next Step"
              CN={{
                bgcolor: selectedStops.length > 0 ? "bg-primary" : "bg-gray-300",
                color: "text-white"
              }}
              disabled={selectedStops.length === 0}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default StopsMap;
