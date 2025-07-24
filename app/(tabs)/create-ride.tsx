import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Coordinates, Stop, Route, RideType as RideTypeEnum } from '@/types/ride'
import Button from '@/components/button'
import { useCreateRide } from '@/redux/hooks/rideHook'
import { useSelector } from 'react-redux'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'

// Step components
import Source from '@/components/ride/Source'
import Destination from '@/components/ride/Destination'
import PickDate from '@/components/ride/PickDate'
import PickTime from '@/components/ride/PickTime'
import RideType from '@/components/ride/RideType'
import Capacity from '@/components/ride/Capacity'
import Pricing from '@/components/ride/Pricing'
import Amenities from '@/components/ride/Amenities'
import ConfirmRide from '@/components/ride/ConfirmRide'
import StopsMap from '../../components/ride/StopsMap'
import Routes from '../../components/ride/Routes'

interface CreateRideState {
  fromLocation: string;
  fromCoordinates: Coordinates | null;
  toLocation: string;
  toCoordinates: Coordinates | null;
  selectedDate: Date;
  selectedTime: Date;
  rideType: RideTypeEnum;
  seats: number;
  cargoCapacity: number;
  pricePerSeat: number;
  priceCargoCapacity: number;
  amenities: Record<string, boolean>;
  instantBooking: boolean;
  selectedStops: Stop[];
  selectedRoute: Route | null;
  isLoading: boolean;
  error: string | null;
  distance: string;
  duration: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const steps = [
  "Select Source",
  "Select Destination",
  "Select Route",
  "Select Stops",
  "Pick Date",
  "Pick Time",
  "Select Ride Type",
  "Set Capacity",
  "Amenities",
  "Confirm Ride",
];

const CreateRide = () => {
  const [step, setStep] = useState(0)
  const [editMode, setEditMode] = useState<string | null>(null)
  const { createRide } = useCreateRide()
  const user = useSelector((state: any) => state.user)
  const vehicle = useSelector((state: any) => state.vehicle.vehicles)

  const [state, setState] = useState<CreateRideState>({
    fromLocation: "",
    fromCoordinates: null,
    toLocation: "",
    toCoordinates: null,
    selectedDate: new Date(),
    selectedTime: new Date(),
    rideType: "passenger",
    seats: 1,
    cargoCapacity: 1,
    pricePerSeat: 100,
    priceCargoCapacity: 150,
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
  })

  useEffect(() => {
    if (!user?.user?._id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please login to create a ride'
      });
      router.replace('/login');
    }
  }, [user]);

  useEffect(() => {
    if (user?.user?._id && (!vehicle || vehicle.length === 0)) {
      Toast.show({
        type: 'error',
        text1: 'Vehicle Error',
        text2: 'Please add a vehicle from profile to create a ride'
      });
      router.replace('/profile');
    }
  }, [vehicle, user]);

  // Compute available stops from the selected route
  const availableStops = React.useMemo(() => {
    if (state.selectedRoute && state.selectedStops && state.selectedStops.length > 0) {
      return state.selectedStops;
    } else {
      return [
        {
          cityName: "Lahore",
          location: { lat: 31.5204, lng: 74.3587 }
        },
        {
          cityName: "Islamabad",
          location: { lat: 33.6844, lng: 73.0479 }
        },
        {
          cityName: "Karachi",
          location: { lat: 24.8607, lng: 67.0011 }
        },
      ];
    }
  }, [state.selectedRoute, state.selectedStops])

  const validateCurrentStep = (): boolean => {
    switch(step) {
      case 0:
        if (!state.fromLocation || !state.fromCoordinates) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a valid source location'
          });
          return false;
        }
        break;
      case 1:
        if (!state.toLocation || !state.toCoordinates) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a valid destination'
          });
          return false;
        }
        break;
      case 2:
        if (!state.selectedRoute) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a route'
          });
          return false;
        }
        break;
      case 4:
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        const selectedDateStart = new Date(state.selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0); // Set to start of selected date
        
        if (selectedDateStart < today) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select today or a future date'
          });
          return false;
        }
        break;
      case 5:
        const currentDate = new Date();
        const selectedDateTime = new Date(state.selectedDate);
        selectedDateTime.setHours(state.selectedTime.getHours(), state.selectedTime.getMinutes());
        
        // Check if the selected date is today
        const isToday = selectedDateTime.toDateString() === currentDate.toDateString();
        console.log("isToday", isToday);
        console.log("selectedDateTime", selectedDateTime);
        console.log("currentDate", currentDate);
        if (isToday) {
          // For today, require at least 5 hours from now
          const fiveHoursFromNow = new Date(currentDate.getTime() + (5 * 60 * 60 * 1000));
          if (selectedDateTime < fiveHoursFromNow) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'For today\'s rides, please select a time at least 5 hours from now'
            });
            return false;
          }
        } else if (selectedDateTime <= currentDate) {
          // For future dates, just ensure it's not in the past or present
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a future time'
          });
          return false;
        }
        break;
      case 6:
        if (!state.rideType) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a ride type'
          });
          return false;
        }
        break;
      case 7:
        if (state.rideType === "passenger" && (!state.seats || state.seats < 1)) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select at least 1 seat'
          });
          return false;
        }
        if (state.rideType === "cargo" && (!state.cargoCapacity || state.cargoCapacity < 1)) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please enter a valid cargo capacity'
          });
          return false;
        }
        if (state.rideType === "mixed" && (!state.seats || state.seats < 1 || !state.cargoCapacity || state.cargoCapacity < 1)) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please enter both valid seats and cargo capacity'
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep() && step < steps.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // const handleCreateRide = async () => {
  //   try {
  //     setState(prev => ({ ...prev, isLoading: true, error: null }));

  //     if (!user?.user?._id) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Authentication Error',
  //         text2: 'Please login to create a ride'
  //       });
  //       return;
  //     }

  //     const preferredVehicle = vehicle?.find((v: any) => v.isPreferred === true);
  //     if (!preferredVehicle?._id) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Vehicle Error',
  //         text2: 'Please add a vehicle from profile to create a ride'
  //       });
  //       return;
  //     }

  //     const rideData = {
  //       ...state,
  //       driverId: user.user._id,
  //       vehicleId: preferredVehicle._id,
  //       createdAt: new Date().toISOString(),
  //       status: 'pending'
  //     };

  //     const response = await createRide(rideData) as ApiResponse;
      
  //     if (!response?.success) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: response?.message || 'Failed to create ride. Please try again.'
  //       });
  //       return;
  //     }

  //     Toast.show({
  //       type: 'success',
  //       text1: 'Success',
  //       text2: 'Ride created successfully!'
  //     });

  //     setTimeout(() => {
  //       router.replace('/(tabs)');
  //     }, 2000);

  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to create ride';
  //     setState(prev => ({ ...prev, error: errorMessage }));
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: errorMessage
  //     });
  //   } finally {
  //     setState(prev => ({ ...prev, isLoading: false }));
  //   }
  // };

  const renderStep = () => {
    switch(step) {
      case 0:
        return <Source
          fromLocation={state.fromLocation}
          setFromLocation={(location) => setState(prev => ({ ...prev, fromLocation: location }))}
          setFromCoordinates={(coords) => setState(prev => ({ ...prev, fromCoordinates: coords }))}
          onNext={handleNext}
        />
      case 1:
        return <Destination
          toLocation={state.toLocation}
          setToLocation={(location) => setState(prev => ({ ...prev, toLocation: location }))}
          setToCoordinates={(coords) => setState(prev => ({ ...prev, toCoordinates: coords }))}
          onNext={handleNext}
        />
      case 2:
        return state.fromCoordinates && state.toCoordinates ? (
          <Routes
            onNext={handleNext}
            onBack={handleBack}
            fromLocation={state.fromLocation}
            toLocation={state.toLocation}
            fromCoordinates={state.fromCoordinates}
            toCoordinates={state.toCoordinates}
            setSelectedRoute={(route) => {
              setState(prev => ({ 
                ...prev, 
                selectedRoute: route,
                distance: route?.routes[0]?.legs[0]?.distance?.text || "",
                duration: route?.routes[0]?.legs[0]?.duration?.text || ""
              }));
            }}
            setStops={(stops) => {
              setState(prev => ({ ...prev, selectedStops: stops }));
            }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600 mb-4">
              Please select valid locations first
            </Text>
            <Button
              onPress={handleBack}
              text="Go Back"
              CN={{ bgcolor: "bg-primary", color: "text-white" }}
            />
          </View>
        )
      case 3:
        return state.fromCoordinates && state.toCoordinates ? (
          <StopsMap
            fromLocation={state.fromLocation}
            toLocation={state.toLocation}
            selectedRoute={state.selectedRoute}
            stops={availableStops}
            addStop={(stops) => setState(prev => ({ ...prev, selectedStops: stops }))}
            nextStep={handleNext}
            prevStep={handleBack}
            fromCoordinates={state.fromCoordinates}
            toCoordinates={state.toCoordinates}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600 mb-4">
              Please select valid locations first
            </Text>
            <Button
              onPress={handleBack}
              text="Go Back"
              CN={{ bgcolor: "bg-primary", color: "text-white" }}
            />
          </View>
        )
      case 4:
        return <PickDate
          selectedDate={state.selectedDate}
          setSelectedDate={(date) => setState(prev => ({ ...prev, selectedDate: date }))}
          onNext={handleNext}
        />
      case 5:
        return <PickTime
          selectedTime={state.selectedTime}
          setSelectedTime={(time) => setState(prev => ({ ...prev, selectedTime: time }))}
          onNext={handleNext}
        />
      case 6:
        return <RideType
          rideType={state.rideType}
          setRideType={(type) => setState(prev => ({ ...prev, rideType: type }))}
          onNext={handleNext}
        />
      case 7:
        return <Capacity
          rideType={state.rideType}
          seats={state.seats}
          setSeats={(seats) => setState(prev => ({ ...prev, seats }))}
          cargoCapacity={state.cargoCapacity}
          setCargoCapacity={(capacity) => setState(prev => ({ ...prev, cargoCapacity: capacity }))}
          onNext={handleNext}
        />
      case 8:
        return <Amenities
          amenities={state.amenities}
          setAmenities={(amenities) => setState(prev => ({ ...prev, amenities }))}
          instantBooking={state.instantBooking}
          setInstantBooking={(instantBooking) => setState(prev => ({ ...prev, instantBooking }))}
          onNext={handleNext}
        />
      case 9:
        return <ConfirmRide
          {...state}
          // onConfirm={handleCreateRide}
          isLoading={state.isLoading}
          instantBooking={state.instantBooking}
          editMode={editMode}
          setEditMode={setEditMode}
          setSeats={(seats) => setState(prev => ({ ...prev, seats }))}
          setCargoCapacity={(capacity) => setState(prev => ({ ...prev, cargoCapacity: capacity }))}
          setPricePerSeat={(price) => setState(prev => ({ ...prev, pricePerSeat: price }))}
          nextStep={handleNext}
          endsteps={setStep}
          setstate={setState}
          stops={state.selectedStops}
        />
      default:
        return null
    }
  }

  if (!user?.user?._id) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        {step > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            className="mr-4"
            disabled={state.isLoading}
          >
            <Ionicons name="chevron-back" size={24} color="#2DBEFF" />
          </TouchableOpacity>
        )}
        <Text className="text-lg font-semibold text-secondary flex-1">
          {steps[step]}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-gray-200">
        <View
          className="h-full bg-primary"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4">
        {state.error && (
          <View className="bg-red-100 p-3 rounded-lg mb-4">
            <Text className="text-red-600">{state.error}</Text>
          </View>
        )}
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreateRide;
