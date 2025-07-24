import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { CreateRideState } from 'types/ride';
import Button from 'components/button';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRide } from '@/redux/hooks/rideHook';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AxiosResponse } from 'axios';

interface RideData {
  instantBooking: boolean;
  amenities: Record<string, boolean>;
  driverId: string;
  vehicleId: string;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
  polyline?: string;
  fromLocation: string;
  toLocation: string;
  time: string;
  stops: any[];
  endtime: string;
  selectedDate: string;
  rideType: string;
  distance: string;
  duration: string;
  seats?: number;
  cargoCapacity?: number;
}

interface ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}

interface ConfirmRideProps extends CreateRideState {
  // onConfirm: () => void;
  isLoading: boolean;
  instantBooking: boolean;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
  selectedRoute: any;
  editMode: string | null;
  setEditMode: (mode: string | null) => void;
  setSeats: (seats: number) => void;
  setCargoCapacity: (capacity: number) => void;
  stops: any[];
  distance: string;
  duration: string;
  nextStep: () => void;
  endsteps: (step: number) => void;
  setstate: React.Dispatch<React.SetStateAction<CreateRideState>>;
}

const calculateArrivalTime = (departureTime: string, duration: string) => {
  if (!departureTime || !duration) return "Calculating...";

  const [timePart, period] = departureTime.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  let totalMinutes = (hours % 12) * 60 + minutes;
  if (period === "PM") totalMinutes += 12 * 60;

  const [durationHours, durationMinutes] = duration.match(/\d+/g)?.map(Number) || [0, 0];
  let durationTotalMinutes = (durationHours * 60) + durationMinutes;

  totalMinutes += durationTotalMinutes;

  let newHours = Math.floor((totalMinutes / 60) % 24);
  let newMinutes = totalMinutes % 60;

  let newPeriod = newHours >= 12 ? "PM" : "AM";
  newHours = newHours % 12 || 12;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")} ${newPeriod}`;
};

const ConfirmRide: React.FC<ConfirmRideProps> = ({
  instantBooking,
  amenities,
  fromCoordinates,
  toCoordinates,
  selectedRoute,
  editMode,
  setEditMode,
  fromLocation,
  toLocation,
  selectedTime,
  selectedDate,
  rideType,
  seats,
  cargoCapacity,
  setSeats,
  setCargoCapacity,
  stops,
  distance,
  duration,
  nextStep,
  endsteps,
  setstate
}) => {
  const { createRide, isLoading, error } = useCreateRide();
  const user = useSelector((state: any) => state.user);
  const vehicle = useSelector((state: any) => state.vehicle.vehicles);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const router = useRouter();

  // Log all incoming props
  // console.log('ConfirmRide Props:', {
  //   instantBooking,
  //   amenities,
  //   fromCoordinates,
  //   toCoordinates,
  //   selectedRoute,
  //   editMode,
  //   fromLocation,
  //   toLocation,
  //   selectedTime,
  //   selectedDate,
  //   rideType,
  //   seats,
  //   cargoCapacity,
  //   stops,
  //   distance,
  //   duration
  // });

  // Log Redux state
  // console.log('Redux State:', {
  //   user,
  //   vehicle,
  //   isLoading,
  //   error
  // });

  useEffect(() => {
    if (user?.user?._id) {
      setDriverId(user.user._id);
      console.log('Driver ID set:', user.user._id);
    }
    const preferredVehicle = vehicle?.find((v: any) => v.isPreferred === true);
    if (preferredVehicle?._id) {
      setVehicleId(preferredVehicle._id);
      console.log('Vehicle ID set:', preferredVehicle._id);
    }
  }, [user, vehicle]);

  // Log state changes
  useEffect(() => {
    console.log('State Values:', {
      driverId,
      vehicleId
    });
  }, [driverId, vehicleId]);

  const validateRideData = (rideData: any, rideType: string) => {
    if (!rideData.driverId || !rideData.vehicleId) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please log in and try again.',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    if (!rideData.fromCoordinates || !rideData.toCoordinates) {
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Please select valid pickup and drop-off locations.',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    const distanceValue = parseInt(rideData.distance.split(" ")[0]);
    if (distanceValue > 1000) {
      Toast.show({
        type: 'error',
        text1: 'Distance Error',
        text2: 'Route distance exceeds maximum allowed (1000 km).',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    if (rideType === "passenger" && (!rideData.seats || rideData.seats < 1)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please specify at least 1 seat for passenger rides.',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    if (rideType === "cargo" && (!rideData.cargoCapacity || rideData.cargoCapacity < 1)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please specify valid cargo capacity.',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    if (rideType === "mixed" &&
        (!rideData.seats || rideData.seats < 1 ||
         !rideData.cargoCapacity || rideData.cargoCapacity < 1)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'For mixed rides, please specify both seats and cargo capacity.',
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }

    return true;
  };

  const handlePublishRide = async () => {
    try {
      if (!driverId || !vehicleId) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please make sure you have a driver profile and vehicle set up",
          position: "bottom",
          visibilityTime: 2000,
          autoHide: true
        });
        return;
      }

      // Format the polyline data
      const formattedPolyline = selectedRoute?.polyline?.points || '';

      // Format dates and times
      const formattedTime = selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const formattedEndTime = selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const rideData: RideData = {
        instantBooking,
        amenities,
        driverId,
        vehicleId,
        fromCoordinates,
        toCoordinates,
        polyline: formattedPolyline,
        fromLocation,
        toLocation,
        time: formattedTime,
        stops,
        endtime: formattedEndTime,
        selectedDate: formattedDate,
        rideType,
        distance,
        duration,
        seats: rideType === "passenger" ? seats : undefined,
        cargoCapacity: rideType === "cargo" ? cargoCapacity : undefined,
      };

      console.log("Sending ride data:", rideData);

      const response = await createRide(rideData);
      console.log("Backend response:", response?.data);

      if (response?.statusCode === 200 && response.success === true) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.message || "Ride published successfully!",
          position: "top",
          visibilityTime: 2000,
          autoHide: true
        });

        // Reset state to default values
        setstate({
          fromLocation: "",
          fromCoordinates: null,
          toLocation: "",
          toCoordinates: null,
          selectedDate: new Date(),
          selectedTime: new Date(),
          rideType: "passenger",
          seats: 1,
          cargoCapacity: 1,
          amenities: {
            "Smoking Allowed": false,
            "Pets Allowed": false,
            "Air Conditioning": false,
            "Wifi": false,
            "Music": false,
          },
          instantBooking: false,
          selectedStops: [],
          selectedRoute: null,
          isLoading: false,
          error: null,
          distance: "",
          duration: "",
        });

        // Reset step to zero
        endsteps(0);

        // Navigate to home page
        router.push("/");
      } else {
        throw new Error(response?.message || "Failed to publish ride");
      }
    } catch (error) {
      console.error("Error publishing ride:", error);
      Toast.show({
        type: "error",
        text1: "Error publishing ride",
        text2: error instanceof Error ? error.message : "An unexpected error occurred",
        position: "bottom",
        visibilityTime: 2000,
        autoHide: true
      });
    }
  };

  const validateField = (field: number, min: number, message: string) => {
    if (!field || field < min) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: message,
        visibilityTime: 2000,
        autoHide: true
      });
      return false;
    }
    return true;
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoSection = ({ title, icon, children, isLast = false }: any) => (
    <View className={`bg-white p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <View className="flex-row items-center mb-3">
        <View className="bg-primary/10 p-2 rounded-full">
          <Ionicons name={icon} size={20} color="#2DBEFF" />
        </View>
        <Text className="text-base font-esti-medium text-secondary ml-3">{title}</Text>
      </View>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-tertiary text-sm">{label}</Text>
      <Text className="text-secondary font-esti-medium text-sm">{value}</Text>
    </View>
  );

  const RoutePoint = ({ type, location }: { type: 'start' | 'stop' | 'end', location: string }) => {
    const colors = {
      start: 'bg-green-500',
      stop: 'bg-gray-400',
      end: 'bg-red-500'
    };

    return (
      <View className="flex-row items-center py-2">
        <View className={`w-2 h-2 rounded-full ${colors[type]}`} />
        <Text className="text-secondary text-sm ml-3 flex-1">{location}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom:10 }}
          >
            {/* Header */}
            <View className="px-4 py-6 bg-white border-b border-gray-100">
              <Text className="text-2xl font-esti-bold text-secondary">
                Review Ride Details
              </Text>
              <Text className="text-sm text-tertiary mt-1">
                Please verify all information before creating your ride
              </Text>
            </View>

            {/* Route Section */}
            <InfoSection title="Route Information" icon="map">
              <View className="space-y-1">
                <RoutePoint type="start" location={fromLocation} />
                {stops.map((stop, index) => (
                  <RoutePoint key={index} type="stop" location={stop.cityName} />
                ))}
                <RoutePoint type="end" location={toLocation} />
              </View>
            </InfoSection>

            {/* Schedule Section */}
            <InfoSection title="Schedule" icon="calendar">
              <InfoRow label="Date" value={formatDate(selectedDate)} />
              <InfoRow label="Departure Time" value={formatTime(selectedTime)} />
            </InfoSection>

            {/* Ride Details Section */}
            <InfoSection title="Ride Details" icon="car">
              <InfoRow
                label="Type"
                value={rideType.charAt(0).toUpperCase() + rideType.slice(1)}
              />
              {(rideType === "passenger" || rideType === "mixed") && (
                <InfoRow
                  label="Passenger Seats"
                  value={`${seats} seats`}
                />
              )}
              {(rideType === "cargo" || rideType === "mixed") && (
                <InfoRow
                  label="Cargo Space"
                  value={`${cargoCapacity}m³`}
                />
              )}
            </InfoSection>

            {/* Amenities Section */}
            <InfoSection title="Amenities" icon="options">
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(amenities)
                  .filter(([_, value]) => value)
                  .map(([key]) => (
                    <View
                      key={key}
                      className="bg-primary/10 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-primary text-xs">{key}</Text>
                    </View>
                  ))}
              </View>
            </InfoSection>
          </ScrollView>

          {/* Bottom Action Section */}
          <View className="px-4 pt-4 pb-10 bg-white border-t border-gray-100">
            <Button
              onPress={handlePublishRide}
              disabled={isLoading}
              text={isLoading ? "Publishing..." : "Publish Ride"}
              CN={{
                bgcolor: isLoading ? "bg-gray-300" : "bg-primary",
                color: "text-white",
              }}
            />

            <View className="flex-row items-center justify-center mt-3">
              <Ionicons name="information-circle" size={14} color="#6f8b90" />
              <Text className="text-tertiary text-xs ml-1">
                You can edit ride details after creation
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfirmRide;
