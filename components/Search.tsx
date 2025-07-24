import { View, Text, TouchableOpacity, TextInput, Modal, Platform, ActivityIndicator } from 'react-native'
import { useState, useCallback, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useMaps } from '@/redux/hooks/mapHook'
import { debounce } from "lodash";
import { useDispatch, useSelector } from 'react-redux'
import { setDate, setDrop, setPassengers, setPickup } from '@/redux/slices/searchSlice'

// Define search data interface
export interface SearchData {
  fromLocation: string;
  toLocation: string;
  date: string;
  passengers: number;
}

const Search = ({
  handlesearch,
  isSearchPage = false
}: {
  handlesearch: (searchData: SearchData) => void,
  isSearchPage?: boolean
}) => {
  const router = useRouter()
  // State for form inputs
  const { pickup, drop, date, passengers } = useSelector((state: any) => state.search);
  const { handleDestinationChange } = useMaps();
  const [focusedInput, setFocusedInput] = useState<"pickup" | "drop" | null>(null);
  const dropdownRef = useRef(null);
  // State for suggestion dialogs
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const dispatch=useDispatch()
  const fetchSuggestions = useCallback(
    debounce(async (input: string, type: "pickup" | "drop") => {
      if (input.length > 2) {
        setLoading(true);
        // Pass the input directly to handleDestinationChange
        const suggestions = await handleDestinationChange({ target: { value: input } });
        setLoading(false);
        if (type === "pickup") setPickupSuggestions(suggestions || []);
        else setDropSuggestions(suggestions || []);
      } else {
        setLoading(false);
        type === "pickup" ? setPickupSuggestions([]) : setDropSuggestions([]);
      }
    }, 500),
    [handleDestinationChange]
  );
  const handleChange = (value: string, type: "pickup" | "drop") => {
    if (type === "pickup") {
      dispatch(setPickup(value));
      fetchSuggestions(value, "pickup");
    } else {
      dispatch(setDrop(value));
      fetchSuggestions(value, "drop");
    }
    setFocusedInput(type);
  };

  const handleSelect = (location: string, type: "pickup" | "drop") => {
    if (type === "pickup") {
      dispatch(setPickup(location));
      setPickupSuggestions([]);
    } else {
      dispatch(setDrop(location));
      setDropSuggestions([]);
    }
    setFocusedInput(null);
  };
  const handleSearch = () => {
    // Prepare search data
    const searchData = {
      fromLocation: pickup,
      toLocation: drop,
      date: date,
      passengers
    };
    if(searchData.fromLocation === '' || searchData.toLocation === ''){
      alert('Please enter a valid location');
      return;
    }
    console.log('Search with:', searchData);

    // If handlesearch prop is provided, call it with search data
    if (handlesearch) {
      handlesearch(searchData);
    } else {
      // Otherwise navigate to search rides page with search data as params
      router.navigate({
        pathname: '/(screen)/SearchRides',
        params: {
          searchData: JSON.stringify(searchData)
        }
      });
    }
  };

  // Format date for display
  const formatDate = (date: Date | string): string => {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    if (parsedDate.toDateString() === new Date().toDateString()) {
      return 'Today';
    }

    return parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };


  return (
    <>
      <View className={`w-full ${isSearchPage ? 'relative' : 'absolute bottom-24'}`}>
        <View className="mx-6 bg-white rounded-2xl shadow-lg overflow-hidden">
          <View className="p-6 space-y-3">
            {/* From Location Input */}
            <View className="relative">
              <View className="flex flex-row items-center gap-2 border-b border-gray-200 pb-3">
                <Ionicons name="location-outline" size={23} color="gray" />
                <TextInput
                  className="text-lg font-semibold text-secondary flex-1"
                  placeholder="Leaving from"
                  placeholderTextColor="#6f8b90"
                  value={pickup}
                  onChangeText={(text) => handleChange(text, "pickup")}
                />
              </View>

              {/* From Location Suggestions */}
              {focusedInput === "pickup" && (
                <View ref={dropdownRef} className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-[60]">
                  {isLoading ? (
                    <View className="p-3 flex items-center justify-center">
                      <ActivityIndicator color="#2DBEFF" size="small" />
                    </View>
                  ) : pickupSuggestions.length > 0 ? (
                    pickupSuggestions.slice(0, 5).map((location, index) => (
                      <TouchableOpacity key={index} onPress={() => handleSelect(location, "pickup")} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                        <Text className="text-heading text-md font-semibold dark:text-white">{location}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="p-3">
                      <Text className="text-gray-500">Type more to see suggestions</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* To Location Input */}
            <View className="relative">
              <View className="flex flex-row items-center gap-2 border-b border-gray-200 pb-3">
                <Ionicons name="flag-outline" size={22} color="gray" />
                <TextInput
                  className="text-lg font-semibold text-secondary flex-1"
                  placeholder="Going to"
                  placeholderTextColor="#6f8b90"
                  value={drop}
                  onChangeText={(text) => handleChange(text, "drop")}
                />
              </View>

              {/* To Location Suggestions */}
              {focusedInput === "drop" && (
                <View ref={dropdownRef} className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-[60]">
                  {isLoading ? (
                    <View className="p-3 flex items-center justify-center">
                      <ActivityIndicator color="#2DBEFF" size="small" />
                    </View>
                  ) : dropSuggestions.length > 0 ? (
                    dropSuggestions.slice(0, 5).map((location, index) => (
                      <TouchableOpacity key={index} onPress={() => handleSelect(location, "drop")} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                        <Text className="text-heading text-md font-semibold dark:text-white">{location}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="p-3">
                      <Text className="text-gray-500">Type more to see suggestions</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Date Selector */}
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
              <View className="flex flex-row items-center gap-2 border-b border-gray-200 pb-3">
                <Ionicons name="calendar-outline" size={22} color="gray" />
                <Text className="text-lg font-semibold flex-1 text-secondary">{formatDate(date)}</Text>
              </View>
            </TouchableOpacity>

            {/* Calendar Picker */}
            {showCalendar && (
              Platform.OS === 'ios' ? (
                <Modal
                  visible={showCalendar}
                  transparent={true}
                  animationType="slide"
                >
                  <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-5 rounded-t-xl">
                      <View className="flex-row justify-between mb-4">
                        <TouchableOpacity onPress={() => setShowCalendar(false)}>
                          <Text className="text-primary font-semibold text-lg">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowCalendar(false)}>
                          <Text className="text-primary font-semibold text-lg">Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={new Date(date)}
                        mode="date"
                        display="spinner"
                        onChange={(_, selectedDate) => {
                          if (selectedDate) {
                            dispatch(setDate(selectedDate));
                          }
                        }}
                        minimumDate={new Date()}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={new Date(date)}
                  mode="date"
                  display="default"
                  onChange={(_, selectedDate) => {
                    setShowCalendar(false);
                    if (selectedDate) {
                      dispatch(setDate(selectedDate));
                    }
                  }}
                  minimumDate={new Date()}
                />
              )
            )}

            {/* Passenger Selector */}
            <TouchableOpacity onPress={() => setShowPassengerSelector(!showPassengerSelector)}>
              <View className="flex flex-row items-center gap-2 border-b border-gray-200 pb-3">
                <Ionicons name="person-outline" size={22} color="gray" />
                <Text className="text-lg font-semibold flex-1 text-secondary">{passengers} {passengers === 1 ? 'passenger' : 'passengers'}</Text>
              </View>
            </TouchableOpacity>

            {/* Passenger Selector Modal */}
            {showPassengerSelector && (
              <View className="absolute bottom-20 left-0 right-0 bg-white z-10 rounded-lg shadow-md p-4">
                <Text className="text-lg font-semibold text-secondary mb-4">Select passengers</Text>
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => dispatch(setPassengers(Math.max(1, passengers - 1)))}
                    className="bg-gray-200 w-10 h-10 rounded-full justify-center items-center"
                    disabled={passengers <= 1}
                  >
                    <Ionicons name="remove" size={24} color={passengers <= 1 ? '#ccc' : '#054752'} />
                  </TouchableOpacity>

                  <Text className="text-2xl font-bold text-secondary">{passengers}</Text>

                  <TouchableOpacity
                    onPress={() => dispatch(setPassengers(Math.min(8, passengers + 1)))}
                    className="bg-gray-200 w-10 h-10 rounded-full justify-center items-center"
                    disabled={passengers >= 8}
                  >
                    <Ionicons name="add" size={24} color={passengers >= 8 ? '#ccc' : '#054752'} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setShowPassengerSelector(false)}
                  className="mt-4 bg-primary py-2 rounded-full"
                >
                  <Text className="text-white text-center font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            className="w-full bg-primary px-8 py-4"
          >
            <Text className="text-white text-lg text-center font-semibold">Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default Search
