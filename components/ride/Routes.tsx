import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { FontAwesome } from "@expo/vector-icons";
import Button from "@/components/button";
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import axios from "axios";

// Get Google Maps API key for MapViewDirections component
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || 'YOUR GOOGLE MAPS API KEY HERE';

interface RoutesProps {
  onNext: () => void;
  onBack?: () => void; // Make optional since we're not using it
  fromLocation: string;
  toLocation: string;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
  setSelectedRoute: (route: any) => void;
  setStops?: (stops: any[]) => void; // Make optional to handle cases where it's not provided
  selectedRoute?: any; // Make optional since we're not using it directly
}

interface RouteOption {
  index: number;
  distance: string;
  duration: string;
}

// Helper function to filter stops and remove duplicates
const filterStops = (stops: any[]) => {
  let filteredStops: any[] = [];
  // Keep track of seen city names to prevent duplicates
  const seenCities = new Set();

  for (let i = 0; i < stops.length; i++) {
    let stop = stops[i];

    if (!stop || !stop.cityName || stop.cityName === "Unknown City") continue; // Skip unknown locations

    // Only add cities we haven't seen before
    if (!seenCities.has(stop.cityName.toLowerCase())) {
      // Include full address, city, lat, and lng but remove unnecessary fields
      let { instruction, ...filteredStop } = stop;
      filteredStops.push(filteredStop);
      seenCities.add(stop.cityName.toLowerCase());
    }
  }

  return filteredStops;
};

// Helper function to get place details from coordinates
const getPlaceDetails = async (lat: number, lng: number) => {
  try {
    // Direct implementation using Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(url);
    const results = response.data.results;

    if (results && results.length > 0) {
      let cityName = "Unknown City";
      let formattedAddress = results[0].formatted_address || "Unknown Address";

      // Try to extract city name from address components
      for (const component of results[0].address_components) {
        if (component.types.includes("locality")) {
          cityName = component.long_name;
          break;
        } else if (component.types.includes("administrative_area_level_2")) {
          // Fallback to district/county if no city is found
          cityName = component.long_name;
        }
      }

      // If still no city name found, use the first part of the formatted address
      if (cityName === "Unknown City" && formattedAddress) {
        const addressParts = formattedAddress.split(',');
        if (addressParts.length > 0) {
          cityName = addressParts[0].trim();
        }
      }

      return { cityName, formattedAddress };
    }

    // Fallback if no results
    return {
      cityName: "Unknown Location",
      formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
  } catch (error) {
    console.error("Error fetching location details:", error);

    // Fallback for error cases
    return {
      cityName: "Unknown Location",
      formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
  }
};



const Routes: React.FC<RoutesProps> = ({
  onNext,
  fromLocation,
  toLocation,
  fromCoordinates,
  toCoordinates,
  setSelectedRoute,
  setStops,
}) => {
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [directions, setDirections] = useState<any>(null);
  const [selectedDirections, setSelectedDirections] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const screenHeight = Dimensions.get("window").height;

  // Request location permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  // Fetch directions when component mounts
  useEffect(() => {
    if (!fromCoordinates || !toCoordinates) {
      setError('Origin or destination coordinates are missing');
      setLoading(false);
      return;
    }

    fetchDirections();
  }, [fromCoordinates, toCoordinates]);

  // Fetch directions from Google Maps API directly
  const fetchDirections = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call Google Maps Directions API directly
      console.log("Calling Google Maps Directions API");
      const origin = `${fromCoordinates.lat},${fromCoordinates.lng}`;
      const destination = `${toCoordinates.lat},${toCoordinates.lng}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await axios.get(url);
      console.log("Directions API response status:", response.status);

      // Check if response and response.data exist
      if (!response || !response.data) {
        throw new Error('Invalid response from Google Maps API');
      }

      // Check if the response has the expected structure
      if (response.data.status === 'OK' && response.data.routes && response.data.routes.length > 0) {
        // Process routes data
        const routesData = response.data.routes.map((route: any, index: number) => ({
          index,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
        }));

        setRouteOptions(routesData);
        setDirections(response.data);

        // Set the default selected route
        await updateSelectedRoute(response.data, 0);
      } else {
        const status = response.data.status || 'Unknown status';
        const errorMessage = response.data.error_message || 'No routes found';
        setError(`Failed to fetch directions: ${status} - ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error fetching directions:', err);
      setError('Failed to fetch directions: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Update the selected route and extract stops
  const updateSelectedRoute = async (result: any, index: number) => {
    try {
      console.log("Updating selected route:", index);
      const selectedRoute = result.routes[index];

      // Extract start and end points
      let startPoint, endPoint;

      // Handle different formats of location data
      if (selectedRoute.legs[0].start_location.lat && typeof selectedRoute.legs[0].start_location.lat === 'function') {
        // Google Maps API format (lat and lng are functions)
        startPoint = {
          lat: selectedRoute.legs[0].start_location.lat(),
          lng: selectedRoute.legs[0].start_location.lng()
        };

        endPoint = {
          lat: selectedRoute.legs[0].end_location.lat(),
          lng: selectedRoute.legs[0].end_location.lng()
        };
      } else {
        // Our data format (lat and lng are properties)
        startPoint = {
          lat: selectedRoute.legs[0].start_location.lat,
          lng: selectedRoute.legs[0].start_location.lng
        };

        endPoint = {
          lat: selectedRoute.legs[0].end_location.lat,
          lng: selectedRoute.legs[0].end_location.lng
        };
      }

      console.log("Start point:", startPoint);
      console.log("End point:", endPoint);

      // Get detailed information about start and end points
      const startDetails = await getPlaceDetails(startPoint.lat, startPoint.lng);
      const endDetails = await getPlaceDetails(endPoint.lat, endPoint.lng);

      // Create start and end stops with full information
      const startStop = {
        location: { lat: startPoint.lat, lng: startPoint.lng },
        coordinates: [startPoint.lng, startPoint.lat], // Store as [longitude, latitude]
        cityName: startDetails.cityName,
        address: startDetails.formattedAddress
      };

      const endStop = {
        location: { lat: endPoint.lat, lng: endPoint.lng },
        coordinates: [endPoint.lng, endPoint.lat], // Store as [longitude, latitude]
        cityName: endDetails.cityName,
        address: endDetails.formattedAddress
      };

      // Extracting intermediate stops
      const selectedLeg = selectedRoute.legs[0];
      const intermediateStops = await Promise.all(
        selectedLeg.steps.map(async (step: any) => {
          // Handle different formats of location data
          let lat, lng;

          if (step.end_location.lat && typeof step.end_location.lat === 'function') {
            // Google Maps API format
            lat = step.end_location.lat();
            lng = step.end_location.lng();
          } else {
            // Our data format
            lat = step.end_location.lat;
            lng = step.end_location.lng;
          }

          const locationDetails = await getPlaceDetails(lat, lng);
          return {
            location: { lat, lng },
            coordinates: [lng, lat], // Store as [longitude, latitude]
            cityName: locationDetails.cityName,
            address: locationDetails.formattedAddress,
            instruction: step.html_instructions || "Continue on route",
            distance: step.distance.text,
            duration: step.duration.text,
          };
        })
      );

      // Filter out any null stops and deduplicate them
      const validIntermediateStops = intermediateStops.filter((stop) => stop !== null);
      const filteredIntermediateStops = filterStops(validIntermediateStops);

      // Remove any intermediate stops with same city name as start or end
      const uniqueStops = filteredIntermediateStops.filter(stop =>
        stop.cityName.toLowerCase() !== startDetails.cityName.toLowerCase() &&
        stop.cityName.toLowerCase() !== endDetails.cityName.toLowerCase()
      );

      // Add special start and end stops
      uniqueStops.unshift(startStop); // Add at beginning
      uniqueStops.push(endStop);   // Add at end

      console.log("All stops with full address data:", uniqueStops);

      // Only call setStops if it's provided
      if (typeof setStops === 'function') {
        setStops(uniqueStops);
      } else {
        console.warn("setStops function is not provided. Stops data will not be saved.");
      }

      // Set selected route and directions
      setSelectedRoute({...result, routes: [selectedRoute]});
      setSelectedDirections({ ...result, routes: [selectedRoute] });

      // Fit map to show the route
      if (mapRef.current) {
        const coordinates = [
          { latitude: startPoint.lat, longitude: startPoint.lng },
          { latitude: endPoint.lat, longitude: endPoint.lng }
        ];

        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
    } catch (err) {
      console.error("Error updating selected route:", err);

      // Fallback with basic stops if there's an error
      const basicStops = [
        {
          location: { lat: fromCoordinates.lat, lng: fromCoordinates.lng },
          coordinates: [fromCoordinates.lng, fromCoordinates.lat],
          cityName: "Starting Point",
          address: fromLocation
        },
        {
          location: { lat: toCoordinates.lat, lng: toCoordinates.lng },
          coordinates: [toCoordinates.lng, toCoordinates.lat],
          cityName: "Destination",
          address: toLocation
        }
      ];

      console.log("Using fallback stops:", basicStops);

      // Only call setStops if it's provided
      if (typeof setStops === 'function') {
        setStops(basicStops);
      } else {
        console.warn("setStops function is not provided. Fallback stops data will not be saved.");
      }
    }
  };

  // Handle route selection
  const handleRouteSelection = useCallback(
    async (index: number) => {
      console.log("Selecting route:", index);
      setSelectedRouteIndex(index);

      if (directions) {
        await updateSelectedRoute(directions, index);
      }
    },
    [directions, setSelectedRoute]
  );

  // Handle continue button press
  const handleContinue = () => {
    if (routeOptions.length > 0) {
      onNext();
    } else {
      Alert.alert("Error", "Please select a route to continue");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DBEFF" />
        <Text style={styles.loadingText}>Loading routes...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDirections}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 pb-4 bg-white">
        {/* Map Section */}
        <View style={{ height: screenHeight * 0.4 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: fromCoordinates.lat,
              longitude: fromCoordinates.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            className="w-full h-full"
          >
            {/* Origin Marker */}
            <Marker
              coordinate={{
                latitude: fromCoordinates.lat,
                longitude: fromCoordinates.lng,
              }}
              title={fromLocation}
              description="Starting Point"
              pinColor="green"
            />

            {/* Destination Marker */}
            <Marker
              coordinate={{
                latitude: toCoordinates.lat,
                longitude: toCoordinates.lng,
              }}
              title={toLocation}
              description="Destination"
              pinColor="red"
            />

            {/* Directions */}
            {selectedDirections ? (
              <MapViewDirections
                key={`route-${selectedRouteIndex}`} // Force re-render when route changes
                origin={{
                  latitude: fromCoordinates.lat,
                  longitude: fromCoordinates.lng,
                }}
                destination={{
                  latitude: toCoordinates.lat,
                  longitude: toCoordinates.lng,
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="#2DBEFF"
                optimizeWaypoints={true}
                onStart={() => {
                  console.log("Starting directions rendering for route:", selectedRouteIndex);
                }}
                onReady={(result) => {
                  console.log("Directions ready for route:", selectedRouteIndex);
                  // Fit the map to the route
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                }}
                onError={(error) => {
                  console.error("Directions error:", error);
                }}
              />
            ) : (
              // Show a simple polyline while loading
              <Polyline
                coordinates={[
                  { latitude: fromCoordinates.lat, longitude: fromCoordinates.lng },
                  { latitude: toCoordinates.lat, longitude: toCoordinates.lng },
                ]}
                strokeColor="#FF0000"
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>

        {/* Routes List & Button */}
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 120 }} // to make space for tab bar and button
        >
          <Text className="text-2xl font-semibold text-center text-secondary mb-4">
            What is your Route?
          </Text>

          {routeOptions.length > 0 ? (
            <View className="space-y-3">
              {routeOptions.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRouteSelection(index)}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${
                    selectedRouteIndex === index ? "bg-gray-200" : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-secondary">
                        Route {index + 1} - {route.distance} ({route.duration})
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedRouteIndex === index
                        ? "bg-primary border-primary"
                        : "border-primary"
                    }`}
                  >
                    {selectedRouteIndex === index && (
                      <View className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500">No routes available</Text>
          )}

          {/* Button inside scroll so it's visible */}
          <View className="p-4 w-full mx-auto mt-6">
            <Button
              onPress={handleContinue}
              text="Next Step"
              CN={{
                bgcolor: routeOptions.length > 0 ? "bg-primary" : "bg-gray-300",
                color: "text-white",
              }}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2DBEFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Routes;
