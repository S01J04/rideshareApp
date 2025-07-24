import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import axiosInstance from '@/redux/axiosInstance'

// Helper functions from the React code
function convertTo12Hour(timeString: string | undefined): string {
  if (!timeString) return 'N/A';

  let [hours, minutes] = timeString.split(":").map(Number);
  let period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // Convert 00:00 to 12:00 AM

  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function calculateEstimatedTime(startTime: string, durationMinutes: number): string {
  if (!startTime || !durationMinutes) return 'N/A';

  let hours: number, minutes: number, isPM = false;

  // Check if time is already in 12-hour format (contains AM/PM)
  if (startTime.includes('AM') || startTime.includes('PM')) {
    isPM = startTime.includes('PM');
    // Remove AM/PM and split by colon
    const timeOnly = startTime.replace(/\s*[AP]M/i, '');
    [hours, minutes] = timeOnly.split(':').map(Number);

    // Convert 12-hour to 24-hour for calculation
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    // Handle 24-hour format
    [hours, minutes] = startTime.split(':').map(Number);
  }

  // Check if we have valid numbers
  if (isNaN(hours) || isNaN(minutes)) {
    console.warn("Invalid time format:", startTime);
    return 'N/A';
  }


  // Add duration
  let totalMinutes = hours * 60 + minutes + durationMinutes;

  // Convert back to hours and minutes
  let newHours = Math.floor(totalMinutes / 60) % 24;
  let newMinutes = totalMinutes % 60;

  // Format to 12-hour time
  let period = newHours >= 12 ? "PM" : "AM";
  newHours = newHours % 12 || 12;

  return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${period}`;
}
const handlePassengerProfile = async (passenger:any) => {
    const response = await axiosInstance.get(`/users/get-user/${passenger.userId}`);
    console.log("responsedata", response.data);
    await router.push({
        pathname: '/(screen)/PassengerProfile',
        params: { 
            passengerData: JSON.stringify(response.data) 
        }
    });
}
// Define the ride type
interface RideType {
    _id?: string;
    rideCode?: string;
    departureDate?: string;
    starttime?: string;
    endtime?: string;
    totalDistance?: string;
    totalDuration?: string;
    pricePerSeat?: string;
    priceCargoCapacity?: string;
    rideType?: string;
    availableSeats?: number;
    status?: string;
    instantBooking?: boolean;
    pickup?: string;
    drop?: string;
    driverDetails?: {
        _id?: string;
        fullName?: string;
        profilePicture?: string;
        bio?: string;
        preferences?: Array<{selectedOption: string}>;
    };
    vehicleDetails?: {
        model?: string;
        color?: string;
        year?: string;
        plateNumber?: string;
    };
    passengers?: Array<{
        _id?: string;
        userId?: string;
        fullName?: string;
        profilePicture?: string;
    }>;
    matchedRoute?: {
        pickupPoint?: {
            address?: string;
            cityName?: string;
        };
        dropPoint?: {
            address?: string;
            cityName?: string;
        };
        segmentDistance?: string;
        segmentDuration?: string;
        calculatedFare?: string;
        relevantStops?: Array<{
            isPickup?: boolean;
            isDrop?: boolean;
            estimatedDepartureTimeText?: string;
            estimatedArrivalTimeText?: string;
        }>;
    };
}

const RideDetailPage = () => {
    const [showMore, setShowMore] = useState(false);
    const [ride, setRide] = useState<RideType | null>(null);
    const params = useLocalSearchParams();
    const {user}=useSelector((state:RootState)=>state?.user);
 const handleChat=async()=>{
    // console.log("driver",ride);
     const response=await axiosInstance.post(`/chats/create-chat-room/${ride?.driverDetails?._id}`);
     if(response.statusCode===200){
         console.log('chat with driver')
      router.push(`Chat`);
     }
  }
    useEffect(() => {
        // Parse the ride data from params
        if (params.rideData) {
            try {
                // Handle both string and array cases
                const rideDataStr = Array.isArray(params.rideData)
                    ? params.rideData[0]
                    : params.rideData;

                const rideData = JSON.parse(rideDataStr);
                setRide(rideData);
                console.log("Ride data:", rideData);
            } catch (error) {
                console.error("Error parsing ride data:", error);
            }
        }
    }, [params.rideData]);

    // These functions are now directly used in the JSX
  console.log(ride)
    if (!ride) {
        return (
            <View className="flex-1 bg-gray-100 justify-center items-center">
                <Text>Loading ride details...</Text>
            </View>
        );
    }

    // Check if we have matched route segment data from search
    const hasMatchedRoute = ride?.matchedRoute &&
                         (ride?.matchedRoute.pickupPoint || ride?.matchedRoute.dropPoint);

    // Calculate departure and arrival times
    let departureTime = ride?.starttime;
    let arrivalTime;

    if (hasMatchedRoute) {
        // Get first stop (pickup) and last stop (dropoff) from relevantStops
        const relevantStops = ride?.matchedRoute?.relevantStops || [];

        // Use the pickup stop's departure time if available
        const pickupStop = relevantStops.find(stop => stop.isPickup === true);
        const dropStop = relevantStops.find(stop => stop.isDrop === true);

        if (pickupStop?.estimatedDepartureTimeText) {
            departureTime = pickupStop.estimatedDepartureTimeText;
        } else if (pickupStop?.estimatedArrivalTimeText) {
            departureTime = pickupStop.estimatedArrivalTimeText;
        } else {
            departureTime = convertTo12Hour(ride?.starttime);
        }

        // Use the drop stop's arrival time if available
        if (dropStop?.estimatedArrivalTimeText) {
            arrivalTime = dropStop.estimatedArrivalTimeText;
        } else if (ride?.matchedRoute?.segmentDuration) {
            // Try to extract minutes from format like "45 mins" or "1 hrs 20 mins"
            const durationMatch = ride?.matchedRoute?.segmentDuration.match(/(\d+)\s*hrs?\s*(?:(\d+)\s*mins?)?/);
            if (durationMatch) {
                const hours = durationMatch[1] ? parseInt(durationMatch[1]) : 0;
                const mins = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
                const totalMins = hours * 60 + mins;
                arrivalTime = calculateEstimatedTime(departureTime, totalMins);
            } else {
                arrivalTime = convertTo12Hour(ride?.endtime);
            }
        } else {
            arrivalTime = convertTo12Hour(ride?.endtime);
        }
    } else {
        departureTime = convertTo12Hour(ride?.starttime || "19:00");
        arrivalTime = convertTo12Hour(ride?.endtime || "21:40");
    }

    // Price to display
    // const priceTxt = ride?.pricePerSeat ? ride?.pricePerSeat : (ride?.priceCargoCapacity || 'N/A');
    const priceText = hasMatchedRoute && ride?.matchedRoute.calculatedFare
    ? (ride?.rideType === 'cargo' ? ride?.matchedRoute.calculatedFare : ride?.matchedRoute.calculatedFare)
    : priceText;

    return (
        <View className="flex-1 bg-gray-100 relative">
        <View className='bg-white pt-5 pl-2 flex flex-row  ' >
                        <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons className='mr-3' name="chevron-back-outline" size={27} color={"#2DBEFF"} />
                        </TouchableOpacity>
                    </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }} >
            <View className='flex flex-col gap-2'>
                <View className='bg-white px-6 pb-10 pt-4'>
                    {ride?.status === "ongoing" && (
                        <View className='py-3 flex flex-row items-center'>
                            <Ionicons name='alert-circle-outline' className='text-tertiary pr-2' size={18} />
                            <Text>This ride has already departed</Text>
                        </View>
                    )}
                    <Text className='text-secondary text-3xl mb-6 font-bold'>
                        {ride?.departureDate ? format(new Date(ride.departureDate), "EEEE, dd MMMM") : "Date not available"}
                    </Text>
                    <View className="flex flex-row ">
                        <View className="flex flex-col items-start gap-1 justify-evenly">
                            <View>
                                <Text className="text-secondary text-lg font-bold">{departureTime || "N/A"}</Text>
                                <Text className="text-sm text-tertiary">{ride?.totalDuration || "N/A"}</Text>
                            </View>
                            <Text className="text-secondary text-lg font-bold">{arrivalTime || "N/A"}</Text>
                        </View>
                        <View className="flex flex-col items-center justify-center pl-3 pr-2">
                            <View className="h-3 w-3 rounded-full border-2 border-secondary" />
                            <View className="h-10 w-1 bg-secondary" />
                            <View className="h-3 w-3 rounded-full border-2 border-secondary" />
                        </View>
                        <View className="flex flex-col  w-2/3 items-start justify-between">
                            <Text className="text-lg font-bold text-secondary">
                                {hasMatchedRoute && ride?.matchedRoute?.pickupPoint?.cityName
                                    ? ride.matchedRoute.pickupPoint.cityName
                                    : ride?.pickup || "Pickup Location"}
                                {'\n'}
                                <Text className='text-sm border text-tertiary'>
                                    {hasMatchedRoute && ride?.matchedRoute?.pickupPoint?.address
                                        ? ride.matchedRoute.pickupPoint.address
                                        : ""}
                                </Text>
                            </Text>
                            <Text className="text-lg font-bold text-secondary">
                                {hasMatchedRoute && ride?.matchedRoute?.dropPoint?.cityName
                                    ? ride.matchedRoute.dropPoint.cityName
                                    : ride?.drop || "Drop Location"}
                                {'\n'}
                                <Text className='text-sm text-tertiary'>
                                    {hasMatchedRoute && ride?.matchedRoute?.dropPoint?.address
                                        ? ride.matchedRoute.dropPoint.address
                                        : ""}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <View className='bg-white px-6 py-6'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='text-secondary text-xl font-semibold'>
                            {ride?.availableSeats ? `${ride.availableSeats} seat${ride.availableSeats !== 1 ? 's' : ''} available` : '1 passenger'}
                        </Text>
                        <Text className='text-secondary text-xl font-semibold'>
                            Rs {priceText || '400'}
                        </Text>
                    </View>
                </View>
                <View className='bg-white px-6 py-6'>
                    <TouchableOpacity
                        onPress={() => {
                            if (ride?.driverDetails?.fullName) {
                                router.push({
                                    pathname: "/Driverprofile",
                                    params: { driverData: JSON.stringify(ride) }
                                });
                            }
                        }}
                        className='flex flex-row items-center justify-between'
                    >
                        <View className='flex flex-row items-center'>
                            <View className="rounded-full border-2 border-primary h-14 w-14 overflow-hidden">
                                <Image
                                    className="h-full w-full rounded-full"
                                    source={{
                                        uri: ride?.driverDetails?.profilePicture ||
                                             'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjDGMp734S91sDuUFqL51_xRTXS15iiRoHew&s'
                                    }}
                                />
                            </View>
                            <View className="flex flex-col justify-center pl-2">
                                <Text className="text-secondary font-bold">
                                    {ride?.driverDetails?.fullName || "Driver"}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    <Ionicons name="star" /> 4.5 - 22 ratings
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Ionicons name='chevron-forward-outline' size={30} color='#6f8b90' />
                        </View>
                    </TouchableOpacity>
                    <View className='flex mt-8 flex-row gap-5'>
                        <Ionicons name='shield-checkmark-outline' size={23} color={"#2DBEFF"} />
                        <Text className='text-tertiary font-bold'>Verified profile</Text>
                    </View>
                    <View className='flex my-3 flex-row gap-5'>
                        <Ionicons name='calendar-outline' size={23} color={"#6f8b90"} />
                        <Text className='text-tertiary font-semibold'>Rarely cancels the ride</Text>
                    </View>
                    <Text
                        className="text-tertiary"
                        numberOfLines={showMore ? undefined : 3}
                    >
                        {ride?.driverDetails?.bio || "Experienced driver with a good rating. Ensures a comfortable and safe journey for all passengers."}
                    </Text>

                    {!showMore && (
                        <TouchableOpacity onPress={() => setShowMore(true)}>
                            <Text className="text-primary">See more</Text>
                        </TouchableOpacity>
                    )}
                    <View className='w-full border my-5 border-gray-300 mx-auto'></View>

                    {ride?.instantBooking ? (
                        <View className='flex items-center my-2 flex-row gap-5'>
                            <Ionicons name='flash-outline' size={23} color={"#2DBEFF"} />
                            <Text className='text-tertiary'>Your booking will be confirmed instantly</Text>
                        </View>
                    ) : (
                        <View className='flex items-center flex-row gap-5'>
                            <Ionicons name='shield-checkmark-outline' size={23} color={"#6f8b90"} />
                            <Text className='text-tertiary'>Your booking won't be confirmed until the driver approves your request</Text>
                        </View>
                    )}

                    <View className='flex my-2 flex-row gap-5'>
                        <Ionicons name='car' size={23} color={"#6f8b90"} />
                        <Text className='text-tertiary font-semibold'>
                            {ride?.vehicleDetails ?
                                `${ride.vehicleDetails.model} - ${ride.vehicleDetails.color} - ${ride.vehicleDetails.year} - ${ride.vehicleDetails.plateNumber}` :
                                "Vehicle details not available"}
                        </Text>
                    </View>

                 {user._id !== ride?.driverDetails?._id &&   <TouchableOpacity
                        onPress={() => {
                            // if (ride?.driverDetails?._id) {
                            //     router.push("/inbox");
                            // }
                            handleChat()
                        }}
                        className='flex items-center justify-center flex-row gap-2 border border-gray-300 w-[90%] mx-auto rounded-full py-3 mt-10'
                    >
                        <Ionicons name='chatbubbles-outline' size={28} color='#2DBEFF' />
                        <Text className='text-primary text-xl font-semibold'>
                            Chat with {ride?.driverDetails?.fullName?.split(' ')[0] || "driver"}
                        </Text>
                    </TouchableOpacity>}
                </View>
                {ride?.passengers?.some(p => Object.keys(p).length > 0) && (
                    <View className='bg-white px-6 py-6'>
                        <Text className='text-secondary text-xl pb-5 font-bold'>Passengers</Text>

                        {ride.passengers
                            .filter((passenger, index, self) =>
                                index === self.findIndex(p => p._id === passenger._id)
                            )
                            .map((passenger, index) => (
                                <TouchableOpacity
                                    key={passenger._id || index}
                                    onPress={() => handlePassengerProfile(passenger)}
                                    className='flex flex-row items-center justify-between mb-3'
                                >
                                    <View className='flex flex-row items-center'>
                                        <View className="rounded-full border-2 border-primary h-14 w-14 overflow-hidden">
                                            <Image
                                                className="h-full w-full rounded-full"
                                                source={{ uri: passenger?.user?.profilePicture || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjDGMp734S91sDuUFqL51_xRTXS15iiRoHew&s' }}
                                            />
                                        </View>
                                        <View className="flex flex-col justify-center pl-2">
                                            <Text className="text-secondary font-bold">{passenger?.user?.fullName}</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Ionicons name='chevron-forward-outline' size={30} color='#6f8b90' />
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )}
            </View>
        </ScrollView>
        <View style={styles.fixedButtonContainer}>
         {user._id !== ride?.driverDetails?._id &&   <TouchableOpacity
                className="bg-primary w-[90%] mx-auto py-4 rounded-full flex items-center justify-center"
                onPress={() => {
                    if (ride?.rideCode) {
                        // Create segment data for the booking
                        const segmentData = hasMatchedRoute ? {
                            startAddress: ride?.matchedRoute?.pickupPoint?.address || ride?.pickup,
                            endAddress: ride?.matchedRoute?.dropPoint?.address || ride?.drop,
                            departureTime: departureTime || convertTo12Hour(ride?.starttime),
                            arrivalTime: arrivalTime || convertTo12Hour(ride?.endtime),
                            distanceText: ride?.matchedRoute?.segmentDistance || ride?.totalDistance || "Unknown",
                            durationText: ride?.matchedRoute?.segmentDuration || ride?.totalDuration || "Unknown",
                            fareText: ride?.matchedRoute?.calculatedFare || ride?.pricePerSeat || "0"
                        } : null;

                        console.log("Navigating to booking with data:", { ride, segmentData });

                        router.push({
                            pathname: "/RideBooking",
                            params: {
                                rideData: JSON.stringify(ride),
                                segment: segmentData ? JSON.stringify(segmentData) : null
                            }
                        });
                    } else {
                        alert('Cannot book this ride at the moment');
                    }
                }}
            >
                <Text className="text-white font-bold text-lg">Book This Ride</Text>
            </TouchableOpacity>}
        </View>
        </View>
    )
}

export default RideDetailPage
const styles = StyleSheet.create({
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
    }
})