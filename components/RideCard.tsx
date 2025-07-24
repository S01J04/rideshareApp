import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Define the ride type
interface Ride {
    _id?: string;
    id?: string;
    rideCode?: string;
    starttime?: string;
    endtime?: string;
    date?: string;
    from?: string;
    to?: string;
    price?: number;
    pricePerSeat?: number;
    rideType?: string;
    totalDuration?: string;
    instantBooking?: boolean;
    driverDetails?: {
        fullName?: string;
        profilePicture?: string;
        rating?: string;
    };
    matchedRoute?: {
        relevantStops?: Array<{
            isPickup?: boolean;
            isDrop?: boolean;
            estimatedDepartureTimeText?: string;
            estimatedArrivalTimeText?: string;
        }>;
        segmentDuration?: string;
        calculatedFare?: number;
        pickupPoint?: {
            address?: string;
        };
        dropPoint?: {
            address?: string;
        };
    };
    startLocation?: {
        address?: string;
    };
    endLocation?: {
        address?: string;
    };
}

const RideCard = ({ ride }: { ride: Ride }) => {
    const [pressed, setPressed] = useState(false);
    const router = useRouter()
    const handleBookClick = () => {
        router.push({
            pathname: "/RideDetailPage",
            params: { rideData: JSON.stringify(ride) }
        });
    };

    // Helper function to limit text length and add ellipsis
    const limitWords = (text: string | undefined, limit = 25): string => {
        if (!text) return "";
        if (text.length <= limit) return text;
        return text.substring(0, limit) + "...";
    };

    // Format the date for display
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "Tomorrow";
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

        // Format for other dates (e.g., "Tuesday 11 March")
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        };
        return date.toLocaleDateString('en-US', options);
    };

    // Get time values from the new structure if available
    const relevantStops = ride?.matchedRoute?.relevantStops || [];
    const pickupStop = relevantStops.find((stop: { isPickup?: boolean }) => stop.isPickup === true);
    const dropStop = relevantStops.find((stop: { isDrop?: boolean }) => stop.isDrop === true);

    // Get departure time (prefer departure time over arrival time)
    const departureTime = pickupStop?.estimatedDepartureTimeText ||
        pickupStop?.estimatedArrivalTimeText ||
        (ride.starttime?.substring(0, 5) || "19:00");

    // Get arrival time
    const arrivalTime = dropStop?.estimatedArrivalTimeText ||
        (ride.endtime?.substring(0, 5) || "21:40");

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={handleBookClick}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            className={`w-[95%] border  px-3  mx-auto rounded-2xl bg-white shadow-sm border-primary ${pressed ? 'border-primary ' : 'border-secondary'}`}
        >
            <View className="flex flex-row justify-between items-center  ">
                <View className="flex flex-row">
                    <View className="flex flex-col items-start  justify-evenly">
                        <View><Text className="text-secondary text-sm font-bold">{departureTime}</Text>
                            <Text className="text-sm text-tertiary">
                                {ride?.matchedRoute?.segmentDuration || ride?.totalDuration || "0h 0m"}
                            </Text></View>
                        <Text className="text-secondary text-sm font-bold">
                            {arrivalTime}
                        </Text>
                    </View>
                    <View className="flex flex-col items-center justify-center pl-3 pr-2">
                        <View className="h-3 w-3 rounded-full border-2 border-secondary" />
                        <View className="h-10 w-1 bg-secondary" />
                        <View className="h-3 w-3 rounded-full border-2 border-secondary" />
                    </View>
                    <View className="flex flex-col items-start justify-between flex-1 mr-2">
                        <Text className="text-md font-bold text-secondary" numberOfLines={1} ellipsizeMode="tail">
                            {limitWords(ride?.matchedRoute?.pickupPoint?.cityName) || ride?.startLocation?.address?.split(',')[0] || ride.from?.split(',')[0] || "Pickup"}
                        </Text>
                        <Text className="text-xs font-bold text-secondary" numberOfLines={1} ellipsizeMode="tail">
                            {limitWords(ride?.matchedRoute?.pickupPoint?.address) || ride?.startLocation?.address?.split(',')[0] || ride.from?.split(',')[0] || "Pickup"}
                        </Text>
                        <Text className="text-md font-bold mt-4 text-secondary" numberOfLines={1} ellipsizeMode="tail">
                            {limitWords(ride?.matchedRoute?.dropPoint?.cityName || ride?.endLocation?.address?.split(',')[0] || ride.to?.split(',')[0] || "Destination")}
                        </Text>
                        <Text className="text-xs font-bold text-secondary" numberOfLines={1} ellipsizeMode="tail">
                            {limitWords(ride?.matchedRoute?.dropPoint?.address || ride?.endLocation?.address?.split(',')[0] || ride.to?.split(',')[0] || "Destination")}
                        </Text>
                    </View>
                    <View className="h-full flex-3 flex   items-end">
                    <Text className="text-md font-bold text-primary" numberOfLines={1}>Rs {
                        ride?.rideType === "cargo"
                            ? ride?.matchedRoute?.calculatedFare || ride.pricePerSeat || ride.price || "16"
                            : ride?.matchedRoute?.calculatedFare || ride.pricePerSeat || ride.price || "16"
                    }</Text>
                </View>
                </View>

            </View>

            <View className="border-t border-gray-300 flex items-center flex-row gap-x-2 px-3 py-4 w-full min-h-5">
                <Ionicons name="car-outline" size={23} color="#6f8b90" />
                <View className="rounded-full border-2 border-primary h-10 w-10 overflow-hidden">
                    <Image
                        className="h-full w-full rounded-full"
                        source={{ uri: ride?.driverDetails?.profilePicture }}
                    />
                </View>
                <View className="flex flex-col justify-center pl-2">
                    <Text className="text-secondary font-bold">{ride?.driverDetails?.fullName || "Driver"}</Text>
                    <Text className="text-sm text-gray-500">
                        <Ionicons name="star" /> {ride?.driverDetails?.rating || "4.7"}
                    </Text>
                </View>
                {ride.instantBooking && <View className="flex flex-row pl-4">
                    <Ionicons name="flash-outline" size={23} color="#6f8b90" />
                    <Text className="text-secondary pl-1">Instant booking</Text>
                </View>
                }
                 
            </View>
        </TouchableOpacity>
    )
}

export default RideCard