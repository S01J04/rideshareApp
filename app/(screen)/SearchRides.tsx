import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateRide } from "@/redux/hooks/rideHook";
import RideCard from "@/components/RideCard";
import RideFilters from "@/components/searchfilter/RideFIlters";
import Search, { SearchData } from "@/components/Search";
import Toast from "react-native-toast-message";
import { useFocusEffect } from '@react-navigation/native';
import { Animated } from "react-native";
import { isToday, isTomorrow, isAfter, addDays, startOfDay } from "date-fns";

const SearchRides = () => {
  const groupRidesByDate = (rides: any[]): { todayRides: any[], tomorrowRides: any[], futureRides: any[] } => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    const todayRides: any[] = [];
    const tomorrowRides: any[] = [];
    const futureRides: any[] = [];

    if (!rides || !rides.length) return { todayRides, tomorrowRides, futureRides };

    rides.forEach((ride: any) => {
      const rideDate = new Date(ride?.departureDate);

      // Convert UTC time to Pakistan Time (UTC+5)
      const localRideDate = new Date(
        rideDate.getUTCFullYear(),
        rideDate.getUTCMonth(),
        rideDate.getUTCDate()
      );

      if (isToday(localRideDate)) {
        todayRides.push(ride);
      } else if (isTomorrow(localRideDate)) {
        tomorrowRides.push(ride);
      } else if (isAfter(localRideDate, tomorrow)) {
        futureRides.push(ride);
      }
    });

    return { todayRides, tomorrowRides, futureRides };
  };

  const [fetchedrides, setfetchrides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All"); // Current active filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // New loading state for search
  const router = useRouter();
  const params = useLocalSearchParams();
  // Extract query params from searchData JSON string
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const rideType = "mix";

  // Add pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    console.log("🔄 Pull-to-refresh triggered");
    setRefreshing(true);
    
    if (pickup && drop && date) {
      fetchRidesWithParams(pickup, drop, date, passengers)
        .finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [pickup, drop, date, passengers]);

  // Clear cached data when component mounts
  useEffect(() => {
    console.log("🧹 Clearing cached data on component mount");
    clearAllRides();
    
    // Cleanup function to clear search parameters when component unmounts
    return () => {
      console.log("🧹 Cleaning up search parameters on unmount");
      setPickup("");
      setDrop("");
      setDate("");
      setPassengers(1);
      setSearchData(null);
    };
  }, []);

  // Add a timestamp to force refresh when new search data is received
  const [searchTimestamp, setSearchTimestamp] = useState(Date.now());

  // Parse search data once when component mounts
  useEffect(() => {
    try {
      console.log("🔍 SearchRides component mounted");
      console.log("📋 Raw params:", params);
      console.log("📋 searchData param:", params.searchData);
      
      if (params.searchData) {
        console.log("✅ Found searchData in params");

        // Handle both string and object formats
        let searchDataObj;
        if (typeof params.searchData === 'string') {
          console.log("📝 Parsing searchData as string");
          searchDataObj = JSON.parse(params.searchData);
        } else {
          console.log("📝 Using searchData as object");
          searchDataObj = params.searchData;
        }

        console.log("📊 Parsed search data:", searchDataObj);

        // Convert date to proper format if it's a date object
        let formattedDate = searchDataObj.date;
        if (searchDataObj.date) {
          if (typeof searchDataObj.date === 'string') {
            // If it's already a string, use it as is
            formattedDate = searchDataObj.date;
          } else if (searchDataObj.date instanceof Date) {
            // If it's a Date object, convert to ISO string
            formattedDate = searchDataObj.date.toISOString().split('T')[0];
          } else if (typeof searchDataObj.date === 'object' && searchDataObj.date.toISOString) {
            // Handle date-like objects
            formattedDate = searchDataObj.date.toISOString().split('T')[0];
          }
        }

        // Set search parameters
        setPickup(searchDataObj.fromLocation || "");
        setDrop(searchDataObj.toLocation || "");
        setDate(formattedDate || "");
        setPassengers(searchDataObj.passengers || 1);

        console.log("🔧 Setting search parameters:", {
          pickup: searchDataObj.fromLocation || "",
          drop: searchDataObj.toLocation || "",
          date: formattedDate || "",
          passengers: searchDataObj.passengers || 1
        });

        // Also set the searchData state for display purposes
        setSearchData({
          fromLocation: searchDataObj.fromLocation || "",
          toLocation: searchDataObj.toLocation || "",
          date: formattedDate || "",
          passengers: searchDataObj.passengers || 1
        });

        console.log("✅ Search data parsed and set successfully");
        
        // Update timestamp to force refresh
        setSearchTimestamp(Date.now());
        
        // Force immediate search with the parsed data
        if (searchDataObj.fromLocation && searchDataObj.toLocation && formattedDate) {
          console.log("🚀 Triggering immediate search with parsed data");
          // Use setTimeout to ensure state updates are complete
          setTimeout(() => {
            fetchRidesWithParams(searchDataObj.fromLocation, searchDataObj.toLocation, formattedDate, searchDataObj.passengers || 1);
          }, 100);
        }
      } else {
        console.log("❌ No search data found in params");
      }
    } catch (error) {
      console.error("❌ Error parsing search data:", error);
    }
  }, [params.searchData]);

  const { fetchRelatedRides, isLoading } = useCreateRide();
  // Define coordinates for proximity calculations (would normally come from Redux)
  const coordinates = null;

  // Fetch rides on page load
  const [allRides, setAllRides] = useState<any[]>([]); // Store all rides initially
  const [originalRides, setOriginalRides] = useState<any[]>([]); // Keep a backup of the original ride data

  // Function to check ride type that handles both data formats
  const checkRideType = (ride: any, type: string): boolean => {
    // Extract the ride type for logging and debugging
    const rideType = ride?.rideType || ride?.type;
    //console.log("Checking ride type:", rideType, "against", type);

    // For the new API format
    if (ride?.rideType) {
      if (type === "Carpool") {
        const matches = ride.rideType === "passenger";
        //console.log(`Carpool check (${ride.rideType}): ${matches}`);
        return matches;
      }
      else if (type === "Cargo") {
        const matches = ride.rideType === "cargo";
        //console.log(`Cargo check (${ride.rideType}): ${matches}`);
        return matches;
      }
      else if (type === "Mix") {
        const matches = ride.rideType === "mixed";
        //console.log(`Mix check (${ride.rideType}): ${matches}`);
        return matches;
      }
    }
    // For the old format
    else if (ride?.type) {
      if (type === "Carpool") {
        const matches = ride.type === "passenger";
        //console.log(`Carpool check (${ride.type}): ${matches}`);
        return matches;
      }
      else if (type === "Cargo") {
        const matches = ride.type === "cargo";
        //console.log(`Cargo check (${ride.type}): ${matches}`);
        return matches;
      }
      else if (type === "Mix") {
        const matches = ride.type === "mixed";
        //console.log(`Mix check (${ride.type}): ${matches}`);
        return matches;
      }
    }

    // For debugging - log when neither property is found
    if (!ride?.rideType && !ride?.type) {
      //console.log("No ride type property found on ride:", ride);
    }

    //console.log(`No match for ${type} against ${rideType}`);
    return false;
  };

  // Create a separate function to fetch rides with specific parameters
  const fetchRidesWithParams = async (fromLocation: string, toLocation: string, searchDate: string, searchPassengers: number) => {
    console.log("🎯 fetchRidesWithParams called with:", { fromLocation, toLocation, searchDate, searchPassengers });
    setIsSearching(true);
    
    try {
      const response = await fetchRelatedRides({
        pickup: fromLocation,
        drop: toLocation,
        date: searchDate,
        passengers: searchPassengers,
        rideType,
      });

      console.log("📡 API Response:", response);

      // Handle successful response with rides
      if (response && Array.isArray((response as any).rides) && (response as any).rides.length > 0) {
        const normalizedRides = (response as any).rides.map((ride: any) => {
          if (!ride.rideType && ride.type) {
            return { ...ride, rideType: ride.type };
          }
          return ride;
        });

        setOriginalRides(normalizedRides);
        setAllRides(normalizedRides);
        setfetchrides(normalizedRides);
        setFilteredRides(normalizedRides);

        const { todayRides, tomorrowRides, futureRides } = groupRidesByDate(normalizedRides);
        settdRides(todayRides);
        settmRides(tomorrowRides);
        setfrRides(futureRides);

        console.log(`✅ Found ${normalizedRides.length} rides`);
        
      
      } else if (response && (response as any).message === "No rides found.") {
        console.log("❌ No rides found for the search criteria");
        clearAllRides();
       
      } else {
        console.log("❌ Empty response received");
        clearAllRides();
     
      }
    } catch (error) {
      console.error("❌ Error fetching rides:", error);
      clearAllRides();
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        text2: 'Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to clear all rides
  const clearAllRides = () => {
    setOriginalRides([]);
    setAllRides([]);
    setfetchrides([]);
    setFilteredRides([]);
    settdRides([]);
    settmRides([]);
    setfrRides([]);
  };

  // Fetch rides when search parameters are available
  useEffect(() => {
    console.log("🔄 Search trigger useEffect called");
    console.log("📊 Current search parameters:", { pickup, drop, date, passengers });
    
    // Only fetch if we have the required parameters
    if (pickup && drop && date) {
      console.log("✅ All required parameters present, fetching rides...");
      fetchRidesWithParams(pickup, drop, date, passengers);
    } else {
      console.log("❌ Missing required parameters:", { 
        hasPickup: !!pickup, 
        hasDrop: !!drop, 
        hasDate: !!date,
        pickup,
        drop,
        date
      });
    }
  }, [pickup, drop, date]); // Depend on the search parameters

  // Create a manual search function that will be called by the search button
  const handleManualSearch = () => {
    console.log("Manual search triggered");
    if (pickup && drop && date) {
      fetchRidesWithParams(pickup, drop, date, passengers);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Missing search parameters',
        text2: 'Please provide pickup, drop, and date.',
      });
    }
  };

  // No need for window.scrollTo in React Native
  useEffect(() => {
    // Component mount effect
  }, []);

  // Note: Sorting is now handled directly in the applyFilters function
  //console.log("All Rides:", allRides);
  // Apply actual filters based on selected filter options
  const applyFilters = (allRides: any[], filters: any): any[] => {
    if (!allRides || !allRides.length || !filters) return allRides;

    // Always work with a fresh copy of the rides to avoid modifying the original
    let result = [...allRides];
    const originalCount = result.length;
    //console.log("Starting filter with rides:", originalCount);

    // Apply pickup time filter (now a single selection)
    const selectedPickupTime = Object.keys(filters.pickupTime).find(key => filters.pickupTime[key]);
    if (selectedPickupTime) {
      const beforeFiltering = result.length;
      result = result.filter(ride => {
        if (!ride.starttime) return true; // Don't filter out rides without starttime

        const hourMinutes = ride.starttime.split(':');
        const hour = parseInt(hourMinutes[0], 10);

        if (selectedPickupTime === "Before 06:00") return hour < 6;
        if (selectedPickupTime === "06:00 - 12:00") return hour >= 6 && hour < 12;
        if (selectedPickupTime === "12:01 - 18:00") return hour >= 12 && hour < 18;
        if (selectedPickupTime === "After 18:00") return hour >= 18;
        return true;
      });
      //console.log(`After pickup time filter (${selectedPickupTime}): ${result.length}/${beforeFiltering} rides`);
    }

    // Apply trust filter - support both data structures
    if (filters.trust["Verified Profile"]) {
      const beforeFiltering = result.length;
      result = result.filter(ride =>
        (ride.driver && ride.driver.isVerified) ||
        (ride.driverDetails && ride.driverDetails.verified)
      );
      //console.log(`After verified profile filter: ${result.length}/${beforeFiltering} rides`);
    }

    // Apply amenity filters (multi-select checkboxes)
    const activeAmenityFilters = Object.entries(filters.amenities)
      .filter(([_, isActive]) => isActive)
      .map(([label]) => label);

    if (activeAmenityFilters.length > 0) {
      const beforeFiltering = result.length;
      result = result.filter(ride => {
        return activeAmenityFilters.every(label => {
          // Match these to the actual structure from your database
          if (label === "Instant Booking") return ride.instantBooking || (ride.features && ride.features.instantBooking);
          if (label === "Smoking Allowed") return ride.features && ride.features.smokingAllowed;
          if (label === "Pets Allowed") return ride.features && ride.features.petsAllowed;
          if (label === "Air Conditioning") return ride.features && ride.features.hasAC;
          return false;
        });
      });
      //console.log(`After amenities filter: ${result.length}/${beforeFiltering} rides`);
    }

    // Apply price range filter - Handle both regular price and segment-specific price
    if (filters.priceRange && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange;
      // Only apply if a real range is selected (not the default full range)
      if (minPrice > 0 || maxPrice < 10000) {
        const beforeFiltering = result.length;
        result = result.filter(ride => {
          // Get price from either regular price or matched segment price
          let price;
          if (ride.matchedRoute && ride.matchedRoute.calculatedFare) {
            price = ride.rideType === 'cargo'
              ? ride.matchedRoute.calculatedFare.cargo
              : ride.matchedRoute.calculatedFare.car;
          } else {
            price = ride.pricePerSeat ? parseFloat(ride.pricePerSeat) : 0;
          }

          return price >= minPrice && price <= maxPrice;
        });
        //console.log(`After price range filter (${minPrice}-${maxPrice}): ${result.length}/${beforeFiltering} rides`);
      }
    }

    // Apply sorting based on the selected sort option
    const sortOption = Object.keys(filters.sortBy).find(key => filters.sortBy[key]);
    if (sortOption) {
      //console.log("Sorting by:", sortOption);
      if (sortOption === "Earliest Departure") {
        result.sort((a, b) => {
          const timeA = a.starttime || "00:00";
          const timeB = b.starttime || "00:00";
          return timeA.localeCompare(timeB);
        });
      } else if (sortOption === "Lowest Price") {
        result.sort((a, b) => {
          // Get price from either regular price or matched segment price
          let priceA, priceB;

          if (a.matchedRoute && a.matchedRoute.calculatedFare) {
            priceA = a.rideType === 'cargo'
              ? a.matchedRoute.calculatedFare.cargo
              : a.matchedRoute.calculatedFare.car;
          } else {
            priceA = a.pricePerSeat || 0;
          }

          if (b.matchedRoute && b.matchedRoute.calculatedFare) {
            priceB = b.rideType === 'cargo'
              ? b.matchedRoute.calculatedFare.cargo
              : b.matchedRoute.calculatedFare.car;
          } else {
            priceB = b.pricePerSeat || 0;
          }

          return priceA - priceB;
        });
      } else if (sortOption === "Close to Departure") {
        // Sort by proximity to departure (if data is available)
        if (coordinates) {
          result.sort(() => {
            // Calculate distance from user to departure point
            // This is a placeholder - you'd need to implement actual distance calculation
            return 0;
          });
        }
      } else if (sortOption === "Close to Arrival Point") {
        // Sort by proximity to arrival (if data is available)
        if (coordinates) {
          result.sort(() => {
            // Calculate distance from user to arrival point
            // This is a placeholder - you'd need to implement actual distance calculation
            return 0;
          });
        }
      }
    }

    // If all rides were filtered out, but we had rides to start with,
    // return the original rides (better to show something than nothing)
    if (result.length === 0 && originalCount > 0) {
      console.warn("All rides were filtered out - returning original set");
      return allRides;
    }

    //console.log(`After applying filters: ${result.length}/${originalCount} rides`);
    return result;
  };

  // Handle filter changes from RideFilters component
  const handleFilterChange = (filters: any) => {
    setAppliedFilters(filters);

    // Always start with the original set of rides
    // This ensures we're not filtering already filtered data
    let ridesForFiltering = [...originalRides];

    // First apply tab filtering
    if (activeTab !== "All") {
      //console.log(`Applying ${activeTab} filter to ${ridesForFiltering.length} rides`);
      ridesForFiltering = ridesForFiltering.filter((ride) => checkRideType(ride, activeTab));

      // If no rides match the selected tab after filtering, show a warning and use all rides
      if (ridesForFiltering.length === 0) {
        console.warn(`No rides match the '${activeTab}' type after filtering. Using all rides.`);
        ridesForFiltering = [...originalRides];
      }
    }

    //console.log(`Rides after tab filtering: ${ridesForFiltering.length}`);

    // Then apply detailed filters
    const newFilteredRides = applyFilters(ridesForFiltering, filters);
    setFilteredRides(newFilteredRides);
    setfetchrides(newFilteredRides);

    // Update date-grouped rides
    const { todayRides, tomorrowRides, futureRides } = groupRidesByDate(newFilteredRides);
    settdRides(todayRides);
    settmRides(tomorrowRides);
    setfrRides(futureRides);

    //console.log(`Final filtered rides: ${newFilteredRides.length}`);
  };

  const tabs = [
    { label: "All", iconName: "chain" },
    { label: "Carpool", iconName: "car" },
    { label: "Cargo", iconName: "truck" },
    { label: "Mix", iconName: "group" },
  ];

  // Add a state for tab change loading
  // Loading state for tab changes (not currently used in UI)
  const [, setIsTabChanging] = useState(false);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return; // Don't do anything if clicking the same tab

    // Set loading state to true
    setIsTabChanging(true);
    setActiveTab(tab);

    //console.log(`Tab changed to: ${tab}`);
    //console.log(`Original rides count: ${originalRides.length}`);

    // Use setTimeout to allow the UI to update before doing expensive operations
    setTimeout(() => {
      // Always start with a fresh copy of the original rides
      let tabFiltered = [...originalRides];

      // For debugging, log the types of all rides
      const rideTypeCounts = tabFiltered.reduce<Record<string, number>>((counts, ride) => {
        const type = ride?.rideType || ride?.type || 'unknown';
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {});
      //console.log("Ride types in original data:", rideTypeCounts);

      // Apply tab filtering
      if (tab !== "All") {
        const beforeFiltering = tabFiltered.length;
        tabFiltered = tabFiltered.filter((ride) => checkRideType(ride, tab));
        //console.log(`After ${tab} filtering: ${tabFiltered.length}/${beforeFiltering} rides`);

        // Only fall back to all rides if we have zero matches AND there are rides of that type
        // but they have been filtered out due to other issues
        if (tabFiltered.length === 0) {
          // Check if we have any rides that should match this type
          const shouldHaveMatches = tab === "Carpool" &&
            originalRides.some(r => (r.rideType === "passenger" || r.type === "passenger"));
          const shouldHaveCargoMatches = tab === "Cargo" &&
            originalRides.some(r => (r.rideType === "cargo" || r.type === "cargo"));
          const shouldHaveMixMatches = tab === "Mix" &&
            originalRides.some(r => (r.rideType === "mixed" || r.type === "mixed"));

          if (shouldHaveMatches || shouldHaveCargoMatches || shouldHaveMixMatches) {
            console.warn(`No rides match the '${tab}' type due to filtering issues. Using original rides filtered by tab.`);
            tabFiltered = originalRides.filter(ride => {
              if (tab === "Carpool") return (ride.rideType === "passenger" || ride.type === "passenger");
              if (tab === "Cargo") return (ride.rideType === "cargo" || ride.type === "cargo");
              if (tab === "Mix") return (ride.rideType === "mixed" || ride.type === "mixed");
              return false;
            });
          } else {
            console.warn(`No rides of type '${tab}' exist in the dataset.`);
            // Keep tabFiltered as empty since there are no matching rides
          }
        }
      } else {
        //console.log(`Showing ALL rides: ${tabFiltered.length}`);
      }

      // Apply any other active filters if they exist AND have been explicitly set by the user
      // This prevents automatically applying filters when just switching tabs
      if (appliedFilters && Object.keys(appliedFilters).some(key => {
        // Check if any filter has active selections
        const filter = appliedFilters[key];
        if (typeof filter === "object" && !Array.isArray(filter)) {
          return Object.values(filter).some(value => value === true);
        }
        return false;
      })) {
        //console.log("Applying additional filters after tab change");
        tabFiltered = applyFilters(tabFiltered, appliedFilters);
      }

      // Update filtered rides
      setFilteredRides(tabFiltered);
      setfetchrides(tabFiltered);

      // Group rides by date
      const { todayRides, tomorrowRides, futureRides } = groupRidesByDate(tabFiltered);
      settdRides(todayRides);
      settmRides(tomorrowRides);
      setfrRides(futureRides);

      //console.log(`Final ride count after tab change: ${tabFiltered.length}`);

      // Set loading state back to false
      setIsTabChanging(false);
    }, 0);
  };

  const [tdRides, settdRides] = useState<any[]>([]);
  const [tmRides, settmRides] = useState<any[]>([]);
  const [frRides, setfrRides] = useState<any[]>([]);
  //console.log(frRides)

  // Group rides by date whenever filtered rides change
  useEffect(() => {
    if (filteredRides?.length >= 0) {
      const { todayRides, tomorrowRides, futureRides } = groupRidesByDate(filteredRides);
      settdRides(todayRides);
      settmRides(tomorrowRides);
      setfrRides(futureRides);
    }
  }, [filteredRides]);



  // State for showing search modal
  const [showsearch, setshowsearch] = useState(false);


  // Parse search data from params if available
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  // Animations
  const slideAnim = new Animated.Value(-100); // Initial position above the screen
  const opacityAnim = new Animated.Value(0); // Initial opacity
  // Function to format date as "Monday 12th"
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);

    // Get day of week (Monday, Tuesday, etc.)
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Get day of month (1, 2, 3, etc.)
    const dayOfMonth = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    let suffix = 'th';
    if (dayOfMonth % 10 === 1 && dayOfMonth !== 11) {
        suffix = 'st';
    } else if (dayOfMonth % 10 === 2 && dayOfMonth !== 12) {
        suffix = 'nd';
    } else if (dayOfMonth % 10 === 3 && dayOfMonth !== 13) {
        suffix = 'rd';
    }

    // Return formatted date (e.g., "Monday 12th")
    return `${dayOfWeek} ${dayOfMonth}${suffix} ${year} `;
  };
  useEffect(() => {
    // Trigger animation on showsearch change
    if (showsearch) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500, // Duration of the slide animation
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500, // Duration of the fade-in animation
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500, // Duration of the slide animation
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500, // Duration of the fade-out animation
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showsearch]); // Runs when showsearch state changes

  useFocusEffect(useCallback(() => {
    console.log("🔄 Focus effect triggered");
    console.log("📊 Current search parameters:", { pickup, drop, date, passengers });
    
    // Only fetch if we have the required parameters
    if (pickup && drop && date) {
      console.log("✅ All required parameters present, fetching rides...");
      fetchRidesWithParams(pickup, drop, date, passengers);
    } else {
      console.log("❌ Missing required parameters:", { 
        hasPickup: !!pickup, 
        hasDrop: !!drop, 
        hasDate: !!date,
        pickup,
        drop,
        date
      });
    }
  }, [pickup, drop, date]));

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="relative bg-white">
        {!isFilterOpen &&
          <View className="w-[90vw]  flex flex-row gap-x-3  mx-auto py-3 items-center border border-gray-300 shadow-slate-500 rounded-3xl">
            <TouchableOpacity className="" onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={23} color={"gray"} />
            </TouchableOpacity>
            <TouchableOpacity className=" flex-1" onPress={() => setshowsearch(!showsearch)}>
              <Text className="font-semibold">
                {searchData?.fromLocation || "From"} <Text>→</Text> {searchData?.toLocation || "To"}
              </Text>
              <Text className="text-sm text-gray-600">
                {date}, {searchData?.passengers } passenger{searchData?.passengers !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity 
              className="mr-2 p-2" 
              onPress={handleManualSearch}
              disabled={isSearching}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color={isSearching ? "#ccc" : "#2563eb"} 
              />
            </TouchableOpacity> */}
            <TouchableOpacity className=" mr-2" onPress={() => setIsFilterOpen(true)}>
              <Ionicons name="options-outline" size={23} color={"gray"} />
            </TouchableOpacity>
          </View>}
        {isFilterOpen && (
          <View className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 overflow-hidden">
            <View className="relative   rounded-lg w-11/12 max-w-md">
              {/* Close button positioned at the top right */}
              <TouchableOpacity
                onPress={() => setIsFilterOpen(false)}
                className=" bg-white shadow-md w-8 h-8 flex items-center justify-center rounded-full"
              // style={{ elevation: 5 }}
              >
                <Text className="text-gray-800 font-bold text-4xl">×</Text>
              </TouchableOpacity>

              <RideFilters allRides={allRides} onFilterChange={handleFilterChange} />
            </View>
          </View>
        )}
        {showsearch && (
          <View className="absolute inset-0 w-[100vw] bg-gray-100 flex items-center justify-start">
            <View
              className="bg-white w-full z-10 h-[60vh] flex flex-col shadow-lg Text-3"
              style={{
                shadowOffset: { width: 0, height: 2 }, // Set shadowOffset inside style object
                shadowOpacity: 0.1, // Set shadowOpacity inside style object
                shadowRadius: 8, // Set shadowRadius inside style object
                elevation: 5, // For Android shadow
              }}
            >
              <Ionicons
                onPress={() => setshowsearch(!showsearch)}
                name="close"
                size={23}
                color={"#2DBEFF"}
              />
              <Text className="text-3xl text-secondary font-bold my-5">Edit your search</Text>
              <Animated.View
                className="w-full h-[450px] relative bg-white border rounded-2xl border-gray-200 pt-5 mt-4 flex justify-center items-center"
                style={{
                  transform: [{ translateY: slideAnim }],
                  opacity: opacityAnim,
                }}
              >
                <Search
                  handlesearch={(newSearchData: SearchData) => {
                    // Update search data and close search modal
                    setSearchData(newSearchData);

                    // Update search parameters
                    setPickup(newSearchData.fromLocation);
                    setDrop(newSearchData.toLocation);
                    setDate(newSearchData.date);
                    setPassengers(newSearchData.passengers);

                    // Close the search modal
                    setshowsearch(false);

                    // Manually trigger a search with the new parameters
                    setTimeout(() => {
                      handleManualSearch();
                    }, 300); // Small delay to ensure state updates have completed
                  }}
                  isSearchPage={true}
                />
              </Animated.View>
            </View>
          </View>
        )}
        {/* Filter Buttons */}
        {!isFilterOpen && <View className="flex flex-row  border-b border-gray-200 w-full  ">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              onPress={() => handleTabChange(tab.label)}
              className={`relative flex-1  items-center text-center text-md rounded-2xl font-semibold py-5 cursor-pointer transition-all ${activeTab === tab.label
                ? "text-primary"
                : "text-subtext hover:bg-gray-200 hover:dark:bg-gray-700"
                }`}
            >
              {tab.iconName && (
                <Ionicons
                  name={tab.iconName === "chain" ? "link" :
                    tab.iconName === "car" ? "car" :
                      tab.iconName === "truck" ? "cube" : "people"}
                  size={18}
                  color={activeTab === tab.label ? "#333" : "#999"}
                  style={{ marginHorizontal: 4 }}
                />
              )}
              <Text className="">{tab.label}</Text>
            </TouchableOpacity>
          ))}
          {/* Tab indicator */}
          <View
            className="absolute bottom-0 h-1 rounded-3xl bg-heading"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${tabs.findIndex((tab) => tab.label === activeTab) * (100 / tabs.length)}%`,
            }}
          >
          </View>

        </View>}
      </View>

      {/* Ride Cards */}
      {!isFilterOpen && <ScrollView 
        className="pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* Available Rides Section */}
        <View className="flex justify-between items-end px-3  mb-6">
          <Text className="text-lg font-bold text-heading">Available Rides</Text>
          <Text className="text-md text-heading font-semibold">
            {fetchedrides?.length} rides available
          </Text>
        </View>

        {isLoading || isSearching ? (
          <View className="flex justify-center items-center h-1/2">
            <View className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></View>
            <Text className="mt-4 text-gray-600">
              {isSearching ? 'Searching for rides...' : 'Loading...'}
            </Text>
          </View>
        ) : tdRides?.length > 0 || tmRides?.length > 0 || frRides?.length > 0 ? (
          <>
            {tdRides?.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-primary px-3">Today</Text>
                {tdRides.map((ride) => (
                  <RideCard key={ride._id || Math.random().toString()} ride={ride} />
                ))}
              </View>
            )}

            {tmRides?.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-primary px-3">Tomorrow</Text>
                {tmRides.map((ride) => (
                  <RideCard key={ride._id || Math.random().toString()} ride={ride} />
                ))}
              </View>
            )}

            {frRides?.length > 0 && (
              <View>
                {frRides.map((ride) => (
                  <View key={ride._id || Math.random().toString()}>
                    <Text className="text-2xl font-semibold text-primary px-3">
                      {formatDate(ride?.departureDate)}
                    </Text>
                    <View className="mt-2">
                      <RideCard ride={ride} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="flex justify-center items-center h-[50vh]">
            <Text className="text-2xl font-bold text-heading">No rides available</Text>
          </View>
        )}
      </ScrollView>}
    </SafeAreaView>
  );
};

export default SearchRides;
