import { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RideFilters({ allRides = [], onFilterChange }: { allRides: any[], onFilterChange: (filters: any) => void }) {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Single-select radio button state for each filter section
  const [sortByFilter, setSortByFilter] = useState<string | null>(null);
  const [pickupTimeFilter, setPickupTimeFilter] = useState<string | null>(null);
  const [trustFilter, setTrustFilter] = useState(false);

  // Multi-select checkbox state for amenities
  const [amenityFilters, setAmenityFilters] = useState<Record<string, boolean>>({
    "Instant Booking": false,
    "Smoking Allowed": false,
    "Pets Allowed": false,
    "Air Conditioning": false
  });

  // Calculate counts for each filter
  const getCounts = () => {
    const counts: {
      sortBy: Record<string, number>;
      pickupTime: Record<string, number>;
      trust: Record<string, number>;
      amenities: Record<string, number>;
    } = {
      sortBy: {
        "Earliest Departure": 0,
        "Lowest Price": 0,
        "Close to Departure": 0,
        "Close to Arrival Point": 0
      },
      pickupTime: {
        "Before 06:00": 0,
        "06:00 - 12:00": 0,
        "12:01 - 18:00": 0,
        "After 18:00": 0
      },
      trust: {
        "Verified Profile": 0
      },
      amenities: {
        "Instant Booking": 0,
        "Smoking Allowed": 0,
        "Pets Allowed": 0,
        "Air Conditioning": 0
      }
    };

    if (!allRides || !allRides.length) return counts;

    // Count rides for each filter option
    allRides.forEach(ride => {
      // Sort by - all rides would apply for each sort method
      counts.sortBy["Earliest Departure"]++;
      counts.sortBy["Lowest Price"]++;
      counts.sortBy["Close to Departure"]++;
      counts.sortBy["Close to Arrival Point"]++;

      // Pickup time
      if (ride.starttime) {
        const hourMinutes = ride.starttime.split(':');
        const hour = parseInt(hourMinutes[0], 10);

        if (hour < 6) counts.pickupTime["Before 06:00"]++;
        else if (hour >= 6 && hour < 12) counts.pickupTime["06:00 - 12:00"]++;
        else if (hour >= 12 && hour < 18) counts.pickupTime["12:01 - 18:00"]++;
        else counts.pickupTime["After 18:00"]++;
      }

      // Trust & Safety - check if driver isVerified
      if (ride?.driverDetails?.verified) {
        counts.trust["Verified Profile"]++;
      }

      // Amenities - based on available data (these might need adjustment based on actual fields)
      // These are example mappings - your actual data structure might be different
      if (ride.features && ride.features.instantBooking) counts.amenities["Instant Booking"]++;
      if (ride.features && ride.features.smokingAllowed) counts.amenities["Smoking Allowed"]++;
      if (ride.features && ride.features.petsAllowed) counts.amenities["Pets Allowed"]++;
      if (ride.features && ride.features.hasAC) counts.amenities["Air Conditioning"]++;
    });

    return counts;
  };

  const counts = getCounts();

  // Clear all filters
  const clearAllFilters = () => {
    setSortByFilter(null);
    setPickupTimeFilter(null);
    setTrustFilter(false);

    setAmenityFilters({
      "Instant Booking": false,
      "Smoking Allowed": false,
      "Pets Allowed": false,
      "Air Conditioning": false
    });

    setPriceRange([0, 1000]);
  };

  // Handle sort by changes
  const handleSortByChange = (value: string) => {
    setSortByFilter(value);
  };

  // Handle pickup time changes
  const handlePickupTimeChange = (value: string) => {
    setPickupTimeFilter(value);
  };

  // Handle trust filter changes
  const handleTrustChange = () => {
    setTrustFilter(!trustFilter);
  };

  // Handle amenity filter changes
  const handleAmenityChange = (label: string) => {
    setAmenityFilters(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Note: Slider functionality is disabled since we don't have the slider component

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        sortBy: sortByFilter ? { [sortByFilter]: true } : {},
        pickupTime: pickupTimeFilter ? { [pickupTimeFilter]: true } : {},
        trust: { "Verified Profile": trustFilter },
        amenities: amenityFilters,
        priceRange
      });
    }
  }, [sortByFilter, pickupTimeFilter, trustFilter, amenityFilters, priceRange]);

  // Our filter categories
  const sortByOptions = [
    { label: "Earliest Departure", key: "1" },
    { label: "Lowest Price", key: "2" },
    { label: "Close to Departure", key: "3" },
    { label: "Close to Arrival Point", key: "4" },
  ];

  const pickupTimeOptions = [
    "Before 06:00",
    "06:00 - 12:00",
    "12:01 - 18:00",
    "After 18:00"
  ];

  const amenityOptions = [
    "Instant Booking",
    "Smoking Allowed",
    "Pets Allowed",
    "Air Conditioning"
  ];

  // Custom radio component that looks like the design
  const CustomRadio = ({ checked, onChange, label, count }: { checked: boolean, onChange: () => void, label: string, count: number }) => (
    <View className="flex flex-row items-center gap-2">
      <TouchableOpacity
        onPress={onChange}
        className={`relative flex items-center justify-center w-5 h-5 border-2 border-primary rounded-full ${
          checked ? "bg-primary" : "bg-transparent"
        }`}
      >
        {checked && (
          <View className="absolute w-3 h-3 bg-white rounded-full"></View>
        )}
      </TouchableOpacity>
      <Text className="flex-1 text-sm md:text-base">{label}</Text>
      <Text className="text-subtext text-xs md:text-sm">{count}</Text>
    </View>
  );

  return (
    <ScrollView
      className="max-h-[80vh] md:max-h-[90vh]"
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="p-4 md:p-6 rounded-3xl bg-white w-full space-y-3 md:space-y-4 max-w-screen">
        {/* Header with Clear Button */}
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg md:text-xl font-bold text-heading">Sort By</Text>
          <TouchableOpacity
            onPress={clearAllFilters}
            className="text-sm text-primary font-semibold"
          >
            <Text className="text-primary text-xs md:text-sm font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>

      {/* Sort By Section */}
      <View>
        <View className="space-y-3 mt-2">
          {sortByOptions.map((item) => (
            <View key={item.label}>
              <CustomRadio
                checked={sortByFilter === item.label}
                onChange={() => handleSortByChange(item.label)}
                label={item.label}
                count={counts.sortBy[item.label.toString()] || 0}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Pickup Time Section */}
      <View className="border-t-2 md:border-t-4 border-gray-200 my-2 md:my-3 pt-2 md:pt-3">
        <Text className="text-base md:text-lg font-bold text-heading">Pick-up Time</Text>
        <View className="space-y-2 md:space-y-3 mt-1 md:mt-2">
          {pickupTimeOptions.map((label) => (
            <View key={label}>
              <CustomRadio
                checked={pickupTimeFilter === label}
                onChange={() => handlePickupTimeChange(label)}
                label={label}
                count={counts.pickupTime[label.toString()] || 0}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Trust & Safety */}
      <View className="border-t-2 md:border-t-4 border-gray-200 my-2 md:my-3 pt-2 md:pt-3">
        <Text className="text-base md:text-lg font-bold text-heading">Trust & Safety</Text>
        <View className="space-y-2 md:space-y-3 mt-1 md:mt-2">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleTrustChange}
              className={`relative flex items-center justify-center w-5 h-5 border-2 border-primary rounded-full ${
                trustFilter ? "bg-primary" : "bg-transparent"
              }`}
            >
              {trustFilter && (
                <View className="absolute w-3 h-3 bg-white rounded-full"></View>
              )}
            </TouchableOpacity>
            <Text className="flex-1 text-sm md:text-base">Verified Profile</Text>
            <Text className="text-subtext text-xs md:text-sm">{counts.trust["Verified Profile"] || 0}</Text>
            <Ionicons name="checkmark-circle" size={20} color="#2DBEFF" />
          </View>
        </View>
      </View>

      {/* Amenities Section */}
      <View className="border-t-2 md:border-t-4 border-gray-200 my-2 md:my-3 pt-2 md:pt-3">
        <Text className="text-base md:text-lg font-bold text-heading">Amenities</Text>
        <View className="space-y-2 md:space-y-3 mt-1 md:mt-2">
          {amenityOptions.map((label) => (
            <View key={label} className="flex flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleAmenityChange(label)}
                className={`relative flex items-center justify-center w-5 h-5 border-2 border-primary rounded ${
                  amenityFilters[label] ? "bg-primary" : "bg-transparent"
                }`}
              >
                {amenityFilters[label] && (
                  <View className="absolute w-3 h-3 bg-white rounded"></View>
                )}
              </TouchableOpacity>
              <Text className="flex-1 text-sm md:text-base">{label}</Text>
              <Text className="text-subtext text-xs md:text-sm">{counts.amenities[label.toString()] || 0}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#2DBEFF" />
            </View>
          ))}
        </View>
      </View>

      {/* Price Range */}
      <View className="border-t-2 md:border-t-4 border-gray-200 my-2 md:my-3 pt-2 md:pt-3">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-base md:text-lg font-bold text-heading">Price Range</Text>
          <Text className="text-primary text-xs md:text-sm font-semibold">
            Rs.{priceRange[0]} - Rs.{priceRange[1]}
          </Text>
        </View>
        <View className="mt-4 md:mt-6">
          {/* Slider placeholder - would need to install @react-native-community/slider */}
          <View className="h-4 md:h-6 bg-gray-200 rounded-full">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(priceRange[1] / 1000) * 100}%` }}
            />
          </View>
          <View className="flex flex-row justify-between mt-2">
            <Text className="text-xs md:text-sm text-subtext">Rs.0</Text>
            <Text className="text-xs md:text-sm text-subtext">Rs.1000</Text>
          </View>
        </View>
      </View>
    </View>
    </ScrollView>
  );
}
