import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCar,
  faArrowRight,
  faClock,
  faCalendar,
  faLocationDot,
  faCheckCircle,
  faPersonWalking,
  faRoad,
  faUser,
  faCircleDot,
  faMapLocationDot,
  faUserAlt,
  faFlag,
  faHistory,
  faPhone,
  faEnvelope,
  faBan
} from "@fortawesome/free-solid-svg-icons";
// import axiosInstance from "../redux/axiosInstance";
import { format } from "date-fns";
import carIcon from "@/assets/car.png"; // Import a car icon for the map
import Toast from 'react-native-toast-message';
// import {socket as socketInstance} from "@/redux/middleware/socketMiddleware";
// import { initializeSocket } from "@/redux/actions/socketAction.ts";
import { Link } from "react-router";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Dimensions, TextInput, RefreshControl } from "react-native";
import { useRouter } from 'expo-router';
import axiosInstance from "@/redux/axiosInstance";
import { initializeSocket } from "@/redux/actions/socketAction";
import { socket as socketInstance } from "@/redux/middleware/socketMiddleware";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';

// Add correct libraries for Google Maps API
// Fix for "The library directions is unknown" error - use geometry instead
// Note: For React Native, use react-native-maps or expo-location instead

export function InputOTPControlled({ value, setValue }: { value: string, setValue: (v: string) => void }) {
  const inputs = Array(6).fill(null)
  const inputRefs = React.useRef<(TextInput | null)[]>([])

  const handleChange = (text: string, index: number) => {
    let newValue = value.split("")
    if (text.length > 1) {
      // Handle paste event
      const pasted = text.slice(0, 6).split("")
      setValue(pasted.join(""))
      return
    }
    

    newValue[index] = text
    const nextValue = newValue.join("").replace(/undefined/g, "")
    setValue(nextValue)

    // Move to next input if text entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <View className="space-y-2  items-center">
      <View className="flex-row justify-center">
        {inputs.map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              inputRefs.current[i] = ref
            }}
            value={value[i] || ""}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            maxLength={1}
            keyboardType="number-pad"
            className={`w-10 h-10 text-lg text-center rounded-md border border-gray-300 dark:border-gray-600 ${i > 0 ? 'ml-2' : ''}`}
          />
        ))}
      </View>

      <Text className="text-sm text-center text-gray-600 dark:text-gray-400">
        {value === "" ? "Enter your one-time password." : `You entered: ${value}`}
      </Text>
    </View>
  )
}


// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem"
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 60,
    color: '#1A1A1A',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#991b1b',
    marginLeft: 8,
  },
  tabContainer: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    minWidth: 100,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2DBEFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2DBEFF',
  },
  badge: {
    backgroundColor: '#2DBEFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  grayBadge: {
    backgroundColor: '#6B7280',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 256,
  },
  contentContainer: {
    flex: 1,
  },
  rideList: {
    flex: 1,
  },
  hiddenOnMobile: {
    display: 'none',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    fontSize: 20,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  rideScrollView: {
    flex: 1,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rideTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rideDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  liveTracking: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  liveTrackingText: {
    fontSize: 14,
    color: '#2DBEFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  selectedRideContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2DBEFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  rideHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  rideTypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  rideDateTime: {
    fontSize: 16,
    color: '#6B7280',
  },
  mapContainer: {
    marginBottom: 24,
    padding: 0,
    marginHorizontal: 0,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  routeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  routeInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  routeLineConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#000',
  },
  routeAddresses: {
    flex: 1,
  },
  routeAddress: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  routeAddressTo: {
    fontSize: 16,
    color: '#1f2937',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 24,
  },
  routeStat: {
    flex: 1,
  },
  routeStatLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  routeStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  driverContainer: {
    marginBottom: 24,
  },
  driverInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#2DBEFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  passengersContainer: {
    marginBottom: 24,
  },
 
  passengerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  passengerDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  pickupDropoff: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  passengerActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    backgroundColor: '#2DBEFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dropoffButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dropoffButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelledStatus: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelledText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  cancellationReason: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  startRideButton: {
    backgroundColor: '#2DBEFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startRideButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeRideButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeRideButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelRideButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelRideButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptySelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptySelectionText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 0,
    marginBottom: 0,
  },
  driverMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2DBEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enableLocationButton: {
    backgroundColor: '#2DBEFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  enableLocationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
};

// 1. Define color constants from tailwind.config.js
const COLOR_PRIMARY = '#2DBEFF';
const COLOR_SECONDARY = '#1A1A1A';
const COLOR_TERTIARY = '#6F8B90';

const Rides = () => {
  // Initial data loading
  const [socket, setSocket] = useState(socketInstance);
  const [selectedTab, setSelectedTab] = useState("active");
  const [rides, setRides] = useState({
    active: [],
    scheduled: [],
    past: []
  });
  const [value, setValue] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [stops, setStops] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Reference to track the interval for location updates
  const locationUpdateIntervalRef = useRef(null);

  // State for tracking if we're sending location updates
  const [isSendingLocation, setIsSendingLocation] = useState(false);

  // State for storing the current ride ID for location updates
  const [currentRideIdForLocation, setCurrentRideIdForLocation] = useState(null);

  // State for storing directions
  const directionsRendererRef = useRef(null);

  // Map and location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user from Redux store
  const user = useSelector((state: any) => state.user?.user) || null;
  const socketFromStore = useSelector((state: any) => state.socket?.socket) || null;
  const ridesFromStore = useSelector((state: any) => state.rides?.rides) || { active: [], scheduled: [], past: [] };
  const notifications = useSelector((state: any) => state.notifications?.notifications) || [];

  // Get dispatch from Redux store
  const dispatch = useDispatch();

  // Get router from Expo Router
  const router = useRouter();

  // Google Maps loading
  // Note: For React Native, use react-native-maps or expo-location instead

  // Initial data loading
  useEffect(() => {
    // Set current user
    setCurrentUser(user);

    // Load rides
    loadRides();
    console.log(user)
    // Set up socket connection if user is logged in and socket exists
    if (user && user._id && socketFromStore) {
      console.log("Setting up socket connection for user:", user._id);
      const cleanup = setupSocketConnection();

      // Join user-specific room
      socketFromStore.emit("join", { userId: user._id });

      return () => {
        // Run cleanup function from setupSocketConnection
        if (cleanup) cleanup();

        // Clean up on unmount
        if (locationUpdateIntervalRef.current) {
          clearInterval(locationUpdateIntervalRef.current);
        }

        // Leave any ride rooms
        if (selectedRide && selectedRide._id) {
          socketFromStore.emit("leave_ride", { rideId: selectedRide._id });
        }
      };
    }
  }, [user, socketFromStore]);
  useEffect(() => {
    if (!socketFromStore) {
      console.log("Socket not initialized, dispatching initializeSocket");
      dispatch(initializeSocket());

      // Wait for socket to be initialized
      const checkSocket = setInterval(() => {
        if (socketInstance) {
          console.log("Socket initialized:", socketInstance.id);
          setSocket(socketInstance);
          clearInterval(checkSocket);
        }
      }, 500);

      return () => clearInterval(checkSocket);
    }
  }, [dispatch, socketFromStore]);

  // Initialize location services on component mount
  useEffect(() => {
    initializeLocation();
  }, []);

  // Setup socket connection
  const setupSocketConnection = () => {
    if (!socketFromStore) {
      console.log("Socket not available for setup");
      return;
    }
    
    console.log("Setting up socket connection with socket ID:", socketFromStore.id);

    // If there's a selected ride, join that ride's room
    if (selectedRide && selectedRide._id) {
      socketFromStore.emit("join_ride", { rideId: selectedRide._id, userId: user._id });
    }

    // Listen for ride updates
    socketFromStore.on("ride_update", handleRideUpdate);

    // Listen for location updates
    socketFromStore.on("location_updated", handleLocationUpdate);

    // Listen for ride status notifications with enhanced handlers
    socketFromStore.on("ride_started", handleRideStarted);
    socketFromStore.on("approaching_pickup", handleApproachingPickup);
    socketFromStore.on("approaching_dropoff", handleApproachingDropoff);
    socketFromStore.on("pickup_confirmed", handlePickupConfirmed);
    socketFromStore.on("passenger_dropped_off", handleDropoffConfirmed);
    socketFromStore.on("ride_completed", handleRideCompleted);
    socketFromStore.on("payment_notification", handlepaymentnotification);
    socketFromStore.on("ride_cancelled", handleRideCancelled);
    socketFromStore.on("dropoff_confirmed", handleRideDropoff);


    // Return cleanup function
    return () => {
      console.log("Cleaning up socket connection");

      // Clean up socket listeners
      socketFromStore.off("ride_update", handleRideUpdate);
      socketFromStore.off("location_updated", handleLocationUpdate);
      socketFromStore.off("ride_started", handleRideStarted);
      socketFromStore.off("approaching_pickup", handleApproachingPickup);
      socketFromStore.off("approaching_dropoff", handleApproachingDropoff);
      socketFromStore.off("pickup_confirmed", handlePickupConfirmed);
      socketFromStore.off("passenger_dropped_off", handleDropoffConfirmed);
      socketFromStore.off("payment_notification", handlepaymentnotification);
      socketFromStore.off("ride_completed", handleRideCompleted);
      socketFromStore.off("ride_cancelled", handleRideCancelled);
      socketFromStore.off("dropoff_confirmed", handleRideDropoff);

    };
  };
  const handleRideDropoff=(data)=>{
    console.log("data drop off",data)
    loadRides()
  }
  const handlepaymentnotification = (data) => {
    console.log("payment socket", data)
  }
  const handleRideUpdate = (data) => {
    if (selectedRide && data.ride && selectedRide._id === data.ride._id) {
      // Filter out cancelled passengers from the ride object
      const updatedRide = {
        ...data.ride,
        passengers: data.ride.passengers.filter(p => !p.cancelled)
      };
      setSelectedRide(updatedRide);
      // Remove cancelled passengers' stops from the map
      setStops(prevStops => prevStops.filter(stop => {
        if (!data.cancelledPassengerId) return true;
        const passenger = data.ride.passengers.find(p => p.userId === data.cancelledPassengerId);
        if (!passenger) return true;
        return !(
          (stop.location.lat === passenger.pickupPoint?.coordinates[1] && stop.location.lng === passenger.pickupPoint?.coordinates[0]) ||
          (stop.location.lat === passenger.dropoffPoint?.coordinates[1] && stop.location.lng === passenger.dropoffPoint?.coordinates[0])
        );
      }));
    }
    loadRides();
  };

  // Enhanced location update handler with improved accuracy
  const handleLocationUpdate = (data) => {
    console.log("Location update received:", data);

    // Update driver location if it's for the currently selected ride
    if (selectedRide && data.rideId === selectedRide._id) {
      const newLocation = {
        coordinates: [data.location.coordinates[0], data.location.coordinates[1]]
      };
      setDriverLocation(newLocation);
      
      // Don't update map region to follow driver - keep showing the entire route
      // Only update if user specifically wants to follow driver (could add a toggle later)
      
      console.log('Driver location updated:', newLocation);
    }
  };

  // Improved ride started handler with more user-friendly notifications
  const handleRideStarted = (data) => {
    console.log("Ride started:", data);
    console.log("ride started on the way")
    // Reload rides to update the lists
    loadRides();

    // If the started ride is the currently selected ride, update it
    if (selectedRide && data.rideId === selectedRide._id) {
      // For drivers, start sending location updates
      if (user?._id === selectedRide.driverId) {
        startSendingLocationUpdates(data.rideId);
      }

      // Show different notifications based on user role
      if (user?._id === selectedRide.driverId) {
        Toast.show({
          type: 'success',
          text1: 'You\'ve started the ride!',
          text2: 'Navigate to pick up your passengers.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Your ride has started!',
          text2: 'Driver is on the way to pick you up.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      }
    } else {
      // Notification for a ride that's not currently viewed
      Toast.show({
        type: 'info',
        text1: 'Your scheduled ride has started!',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
    }
  };

  const handleApproachingPickup = (data) => {
    console.log("Driver approaching pickup:", data);

    // Only show notification if it's for the current user
    const isPassenger = selectedRide?.passengers?.some(passenger => passenger.userId === user?._id);
    if (isPassenger) {
      const isForCurrentUser = data.passengerId === user._id;

      if (isForCurrentUser) {
        Toast.show({
          type: 'success',
          text1: 'Driver is approaching your pickup location!',
          text2: 'Please be ready.',
          position: 'bottom',
          visibilityTime: 6000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      }
    }
  };

  const handleApproachingDropoff = (data) => {
    console.log("Approaching dropoff:", data);

    // Only show notification if it's for the current user
    const isPassenger = selectedRide?.passengers?.some(passenger => passenger.userId === user?._id);
    if (isPassenger) {
      const isForCurrentUser = data.passengerId === user._id;

      if (isForCurrentUser) {
        Toast.show({
          type: 'success',
          text1: 'You\'re approaching your destination!',
          text2: 'Please get ready to exit.',
          position: 'bottom',
          visibilityTime: 6000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      }
    }
  };

  const handlePickupConfirmed = (data) => {
    console.log("Pickup confirmed:", data);
    loadRides();

    // Show different messages based on user role
    if (user?._id === selectedRide?.driverId) {
      Toast.show({
        type: 'success',
        text1: 'Pickup confirmed!',
        text2: 'Navigate to the next destination.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
    } else {
      const isPassenger = selectedRide?.passengers?.some(passenger => passenger.userId === user?._id);
      if (isPassenger && data.passengerId === user._id) {
        Toast.show({
          type: 'success',
          text1: 'Your pickup has been confirmed!',
          text2: 'Enjoy your ride.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      }
    }
  };

  const handleDropoffConfirmed = (data) => {
    console.log("Dropoff confirmed:", data);
    loadRides();

    // Show different messages based on user role
    if (user?._id === selectedRide?.driverId) {
      Toast.show({
        type: 'success',
        text1: 'Passenger drop-off confirmed!',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
    } else {
      const isPassenger = selectedRide?.passengers?.some(passenger => passenger.userId === user?._id);
      if (isPassenger && data.passengerId === user._id) {
        Toast.show({
          type: 'success',
          text1: 'You\'ve been dropped off.',
          text2: 'Thank you for using our service!',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40
        });
      }
    }
  };

  const handleRideCompleted = (data) => {
    console.log("Ride completed:", data);
    console.log('selectedRIde',selectedRide,rides)
    // Clear any location update interval
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
    }
    Toast.show({
      type: 'success',
      text1: 'Your ride has been completed successfully.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40
    });
    window.location.reload()
  };

  // Update the handleRideCancelled function to hide cancelled passengers in the UI
  const handleRideCancelled = (data) => {
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
    }
    Toast.show({
      type: 'error',
      text1: `Ride cancelled: ${data.reason || "No reason provided"}`,
      position: 'bottom',
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40
    });

    // Update UI for both driver and passenger
    if (selectedRide && selectedRide._id === data.rideId) {
      // Filter out cancelled passengers from the ride object
      const updatedRide = {
        ...data.ride,
        passengers: data.ride.passengers.filter(p => !p.cancelled)
      };

      // Update selected ride
      setSelectedRide(updatedRide);

      // Update rides list
      setRides(prev => {
        const updatedActive = prev.active.map(r =>
          r._id === data.rideId ? updatedRide : r
        );
        const updatedScheduled = prev.scheduled.map(r =>
          r._id === data.rideId ? updatedRide : r
        );

        return {
          ...prev,
          active: updatedActive,
          scheduled: updatedScheduled
        };
      });

      // Remove cancelled passenger's stops from the map
      if (data.cancelledPassengerId) {
        setStops(prevStops => prevStops.filter(stop => {
          const passenger = data.ride.passengers.find(p => p.userId === data.cancelledPassengerId);
          if (!passenger) return true;
          return !(
            (stop.location.lat === passenger.pickupPoint?.coordinates[1] && stop.location.lng === passenger.pickupPoint?.coordinates[0]) ||
            (stop.location.lat === passenger.dropoffPoint?.coordinates[1] && stop.location.lng === passenger.dropoffPoint?.coordinates[0])
          );
        }));
      }
    }

    if (socket) {
      socket.emit("leave_ride", { rideId: data.rideId });
    }
  };

  // Load user's rides from the API
  const loadRides = async () => {
    try {
      setLoading(true);

      console.log("Loading rides for user:", user?._id, "role:", user?.role);

      // Fetch rides for both driver and passenger roles separately to debug
      let driverRides = [];
      let passengerRides = [];

      try {
        console.log("Fetching driver rides...");
        const driverResponse = await axiosInstance.get('/rides/driver');
        driverRides = driverResponse.data?.data || driverResponse.data || [];
        console.log("Driver rides fetched:", driverRides.length, "rides");
      } catch (driverError) {
        console.log("Driver rides error:", driverError.response?.data);
      }

      try {
        console.log("Fetching passenger rides...");
        const passengerResponse = await axiosInstance.get('/rides/passenger');
        passengerRides = passengerResponse.data?.data || passengerResponse.data || [];
        console.log("Passenger rides fetched:", passengerRides.length, "rides");
      } catch (passengerError) {
        console.log("Passenger rides error:", passengerError.response?.data);
      }
      
      const allRides = [...driverRides, ...passengerRides];
      console.log("Total rides combined:", allRides.length);

      if (!Array.isArray(allRides)) {
        console.error("Invalid rides data received");
        setRides({
          scheduled: [],
          active: [],
          past: []
        });
        return;
      }

      // Filter scheduled rides
      const scheduled = allRides.filter(ride =>
        ride && (ride.status === "scheduled" || ride.status === "rescheduled" || ride.status === "delayed")
      );

      // Filter active rides (both in_progress and legacy ongoing status)
      const active = allRides.filter(ride =>
        ride && (ride.status === "in_progress" || ride.status === "ongoing")
      );

      // Filter past rides (completed and cancelled with both spellings)
      const past = allRides.filter(ride =>
        ride && ["completed", "cancelled", "canceled"].includes(ride.status)
      );

      console.log("Rides filtered - scheduled:", scheduled.length, "active:", active.length, "past:", past.length);

      setRides({ scheduled, active, past });
      // If no rides in any tab, clear selectedRide
      if (scheduled.length === 0 && active.length === 0 && past.length === 0) {
        setSelectedRide(null);
      }

      setLoading(false);
    } catch (error) {
      console.log("Error loading rides:", error.response?.data);
      // Set empty state on error
      setRides({
        scheduled: [],
        active: [],
        past: []
      });
      setSelectedRide(null);
      Toast.show({
        type: 'error',
        text1: 'Failed to load rides. Please try again.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
      setLoading(false);
    }
  };

  // Pull to refresh callback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  }, []);

  // Handler for selecting a ride
  const handleRideSelect = async (ride) => {
    // Check if socket exists before using it
    if (!socket) {
      console.error("Socket is not initialized");
      Toast.show({
        type: 'error',
        text1: 'Connection issue. Please refresh the page.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
      return;
    }

    // If we're already tracking a ride, leave that room
    if (selectedRide && selectedRide._id && selectedRide._id !== ride._id) {
      socket.emit("leave_ride", { rideId: selectedRide._id });

      // Stop location updates if they were started
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    }

    setSelectedRide(ride);

    // Join the ride-specific room
    socket.emit("join_ride", { rideId: ride._id, userId: user._id });
    console.log(`Joined ride room: ride:${ride._id}`);

    // If the ride is active and current user is driver, start location updates
    if (ride.status === "in_progress" && user?._id === ride.driverId) {
      startSendingLocationUpdates(ride._id);
    }

    // If map is loaded, setup directions
    if (window.google) {
      setupDirections(ride);
    }
  };

  // Improved location sending functionality with error handling and better precision
  const startSendingLocationUpdates = (rideId) => {
    // Check if socket exists
    if (!socket) {
      console.error("Socket is not initialized");
      Toast.show({
        type: 'error',
        text1: 'Connection issue. Please refresh the page.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
      return;
    }

    // Clear any existing interval
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
    }

    console.log(`Starting location updates for ride: ${rideId}`);

    // Function to get and send location with improved error handling
    const sendLocationUpdate = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        const locationData = {
          type: "Point",
          coordinates: [longitude, latitude]
        };

        // Send to server
        socket.emit("update_location", {
          rideId,
          driverId: user._id,
          location: locationData
        });

        console.log(`Location updated: ${latitude}, ${longitude}`);

        // Update local state
        setDriverLocation(locationData);
      } catch (error) {
        console.error("Error getting location:", error);

        // Show a helpful error message based on the error
        if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
          Toast.show({
            type: 'error',
            text1: 'Location access denied. Please enable location services to continue tracking.',
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40
          });
        } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
          Toast.show({
            type: 'error',
            text1: 'Location information is unavailable. Please check your device settings.',
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40
          });
        } else if (error.code === 'E_LOCATION_TIMEOUT') {
          Toast.show({
            type: 'error',
            text1: 'Location request timed out. Please try again.',
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'An unknown error occurred while tracking location.',
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40
          });
        }
      }
    };

    // Send initial location update
    sendLocationUpdate();

    // Set interval to send location updates every 5 seconds (increased frequency)
    locationUpdateIntervalRef.current = setInterval(sendLocationUpdate, 5000);

    // Return a cleanup function to clear the interval
    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  };

  // Improved direction rendering with better options
  const setupDirections = (ride) => {
    if (!window.google) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();

      // Get pickup and dropoff coordinates
      let waypoints = [];
      let origin, destination;

      if (user?._id === ride.driverId) {
        // For driver: show full route with all stops
        origin = {
          lat: ride.startLocation.coordinates[1],
          lng: ride.startLocation.coordinates[0]
        };

        destination = {
          lat: ride.endLocation.coordinates[1],
          lng: ride.endLocation.coordinates[0]
        };

        // Add all passenger pickups and dropoffs as waypoints in the right order
        const allWaypoints = [];

        // Add pickup points
        ride.passengers.forEach(passenger => {
          if (!passenger.pickedUp) {
            allWaypoints.push({
              location: new window.google.maps.LatLng(
                passenger?.pickupPoint?.coordinates[1],
                passenger?.pickupPoint?.coordinates[0]
              ),
              stopover: true,
              type: 'pickup',
              passenger
            });
          }
        });

        // Add dropoff points for passengers who have been picked up
        ride.passengers.forEach(passenger => {
          // Check if passenger has pickedUp property and is picked up, but not dropped off
          if ((passenger.pickedUp || passenger.pickupTime) && !(passenger.droppedOff || passenger.dropoffTime)) {
            allWaypoints.push({
              location: new window.google.maps.LatLng(
                passenger?.dropoffPoint?.coordinates[1],
                passenger?.dropoffPoint?.coordinates[0]
              ),
              stopover: true,
              type: 'dropoff',
              passenger
            });
          }
        });

        // Use optimized waypoints
        waypoints = allWaypoints.map(wp => ({
          location: wp.location,
          stopover: wp.stopover
        }));
      } else {
        // For passenger: show route from current pickup to dropoff
        const passenger = ride.passengers.find(p => p.userId === user._id);

        if (passenger) {
          origin = {
            lat: passenger?.pickupPoint?.coordinates[1],
            lng: passenger?.pickupPoint?.coordinates[0]
          };

          destination = {
            lat: passenger?.dropoffPoint?.coordinates[1],
            lng: passenger?.dropoffPoint?.coordinates[0]
          };
        } else {
          // Fallback if passenger data not found
          origin = {
            lat: ride.startLocation.coordinates[1],
            lng: ride.startLocation.coordinates[0]
          };

          destination = {
            lat: ride.endLocation.coordinates[1],
            lng: ride.endLocation.coordinates[0]
          };
        }
      }

      // Collect all stops for display
      let allStops = [];

      // Add main pickup/dropoff
      allStops.push({
        type: "start",
        location: origin,
        label: "Start",
        iconColor: "green"
      });

      allStops.push({
        type: "end",
        location: destination,
        label: "End",
        iconColor: "red"
      });

      // Add passenger stops with additional status indicators
      ride.passengers.forEach((passenger, index) => {
        const userStop = passenger.userId === user._id;

        // Add pickup with status indicator
        allStops.push({
          type: "pickup",
          location: {
            lat: passenger?.pickupPoint?.coordinates[1],
            lng: passenger?.pickupPoint?.coordinates[0]
          },
          label: userStop ? "Your Pickup" : `Pickup ${index + 1}`,
          iconColor: (passenger.pickedUp || passenger.pickupTime) ? "green" : (userStop ? "blue" : "purple"),
          status: (passenger.pickedUp || passenger.pickupTime) ? "completed" : "pending",
          passenger
        });

        // Add dropoff with status indicator
        allStops.push({
          type: "dropoff",
          location: {
            lat: passenger?.dropoffPoint?.coordinates[1],
            lng: passenger?.dropoffPoint?.coordinates[0]
          },
          label: userStop ? "Your Dropoff" : `Dropoff ${index + 1}`,
          iconColor: (passenger.droppedOff || passenger.dropoffTime) ? "green" : (userStop ? "blue" : "purple"),
          status: (passenger.droppedOff || passenger.dropoffTime) ? "completed" : "pending",
          passenger
        });
      });

      setStops(allStops);

      // Calculate route
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
            Toast.show({
              type: 'error',
              text1: 'Could not calculate route. Please try again.',
              position: 'bottom',
              visibilityTime: 4000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40
            });
          }
        }
      );
    } catch (error) {
      console.error("Error setting up directions:", error);
      Toast.show({
        type: 'error',
        text1: 'Could not calculate route. Please try again.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
    }
  };

  // Helpers for ride status
  const getRideStatusLabel = (status) => {
    switch (status) {
      case "scheduled": return "Scheduled";
      case "in_progress": return "In Progress";
      case "ongoing": return "In Progress"; // Fallback for legacy status
      case "completed": return "Completed";
      case "cancelled":
      case "canceled": return "Cancelled"; // Handle both spellings
      case "delayed": return "Delayed";
      case "rescheduled": return "Rescheduled";
      default: return status;
    }
  };

  const getRideStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "text-blue-500";
      case "in_progress":
      case "ongoing": return "text-green-500"; // Fallback for legacy status
      case "completed": return "text-purple-500";
      case "cancelled":
      case "canceled": return "text-red-500"; // Handle both spellings
      case "delayed": return "text-amber-500";
      case "rescheduled": return "text-indigo-500";
      default: return "text-gray-500";
    }
  };

  // Helper for formatting dates
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  // Effect to join ride-specific room when ride is selected
  useEffect(() => {
    if (selectedRide && selectedRide._id) {
      // Join the ride-specific room
      socket.emit("join_ride", { rideId: selectedRide._id, userId: user._id });

      // Setup the directions for the selected ride
      if (window.google) {
        setupDirections(selectedRide);
      }

      // If ride is active and user is driver, start location updates
      if (selectedRide.status === "in_progress" && user?._id === selectedRide.driverId) {
        startSendingLocationUpdates(selectedRide._id);
      }

      // Cleanup function
      return () => {
        // Leave the ride room
        socket.emit("leave_ride", { rideId: selectedRide._id });

        // Stop location updates if they were started
        if (locationUpdateIntervalRef.current) {
          clearInterval(locationUpdateIntervalRef.current);
        }
      };
    }
  }, [selectedRide, window.google]);

  // Setup directions when selected ride changes
  useEffect(() => {
    if (selectedRide) {
      // Setup the directions for the selected ride
      // Note: Map setup would be handled by react-native-maps in React Native
      setupDirections(selectedRide);
      
      // Calculate map region to show entire route
      calculateRouteRegion(selectedRide);
    }
  }, [selectedRide]);

  // Render nothing if map fails to load
  // Note: In React Native, this would be handled by react-native-maps error handling

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        return true;
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(newLocation);
      
      // Only set map region if no ride is selected (to avoid overriding route view)
      if (!selectedRide) {
        setMapRegion({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
      
      return newLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable to get current location',
        text2: 'Please check your location settings',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40
      });
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Initialize location services
  const initializeLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      await getCurrentLocation();
    }
  };

  // Calculate map region to show entire route
  const calculateRouteRegion = (ride) => {
    if (!ride || !ride.startLocation || !ride.endLocation) return;

    const startLat = ride.startLocation.coordinates[1];
    const startLng = ride.startLocation.coordinates[0];
    const endLat = ride.endLocation.coordinates[1];
    const endLng = ride.endLocation.coordinates[0];

    // Calculate center point
    const centerLat = (startLat + endLat) / 2;
    const centerLng = (startLng + endLng) / 2;

    // Calculate delta to show both points with appropriate padding
    const latDelta = Math.abs(startLat - endLat) * 2.2; // Adjusted for better view
    const lngDelta = Math.abs(startLng - endLng) * 2.2; // Adjusted for better view

    // Ensure minimum zoom level for a good overview
    const minDelta = 0.02; // Adjusted for better minimum zoom
    
    setMapRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, minDelta),
      longitudeDelta: Math.max(lngDelta, minDelta),
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Rides</Text>

      {/* Socket connection error */}
      {!socket && (
        <View style={styles.errorContainer}>
          <FontAwesomeIcon icon={faClock} size={20} color="#ef4444" />
          <Text style={styles.errorText}>Connection issue. Trying to reconnect...</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedTab("active");
              setSelectedRide(null);
            }}
            style={[styles.tabButton, selectedTab === "active" && styles.activeTab]}
          >
            <FontAwesomeIcon icon={faCar} size={16} color={selectedTab === "active" ? COLOR_PRIMARY : COLOR_TERTIARY} />
            <Text style={[styles.tabText, selectedTab === "active" && { color: COLOR_PRIMARY }]}>
              Active Rides
            </Text>
            {rides?.active.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rides?.active.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedTab("scheduled");
              setSelectedRide(null);
            }}
            style={[styles.tabButton, selectedTab === "scheduled" && styles.activeTab]}
          >
            <FontAwesomeIcon icon={faClock} size={16} color={selectedTab === "scheduled" ? COLOR_PRIMARY : COLOR_TERTIARY} />
            <Text style={[styles.tabText, selectedTab === "scheduled" && { color: COLOR_PRIMARY }]}>
              Scheduled
            </Text>
            {rides?.scheduled.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rides?.scheduled.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedTab("past");
              setSelectedRide(null);
            }}
            style={[styles.tabButton, selectedTab === "past" && styles.activeTab]}
          >
            <FontAwesomeIcon icon={faHistory} size={16} color={selectedTab === "past" ? COLOR_PRIMARY : COLOR_TERTIARY} />
            <Text style={[styles.tabText, selectedTab === "past" && { color: COLOR_PRIMARY }]}>
              Past Rides
            </Text>
            {rides?.past.length > 0 && (
              <View style={[styles.badge, styles.grayBadge]}>
                <Text style={styles.badgeText}>{rides?.past.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Loading state */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DBEFF" />
        </View>
      )}

      {/* Content based on selected tab */}
      {!loading && rides && (
        <View style={styles.contentContainer}>
          {/* Left panel: Ride list */}
          <View style={[styles.rideList, selectedRide && styles.hiddenOnMobile]}>
            {/* No rides message */}
            {!rides[selectedTab] || rides[selectedTab].length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon icon={faCar} size={60} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No {selectedTab} rides found</Text>
                {selectedTab === "active" && (
                  <Text style={styles.emptySubtitle}>
                    Your active rides will appear here once they've started
                  </Text>
                )}
                {selectedTab === "scheduled" && (
                  <Text style={styles.emptySubtitle}>
                    Your scheduled rides will appear here after booking
                  </Text>
                )}
                {selectedTab === "past" && (
                  <Text style={styles.emptySubtitle}>
                    Your completed and cancelled rides will appear here
                  </Text>
                )}
              </View>
            ) : (
              <ScrollView 
                style={styles.rideScrollView}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#2DBEFF"]}
                    tintColor="#2DBEFF"
                  />
                }
              >
                {rides[selectedTab].map((ride) => (
                  ride && (
                    <TouchableOpacity
                    key={ride._id}
                      style={styles.rideCard}
                      onPress={() => handleRideSelect(ride)}
                  >
                      <View style={styles.rideHeader}>
                        <View style={styles.rideTitleContainer}>
                          <FontAwesomeIcon icon={faCar} size={20} color={COLOR_PRIMARY} />
                          <Text style={styles.rideTitle}>
                          {ride.startLocation?.address || "No address"}
                            <FontAwesomeIcon icon={faArrowRight} size={12} color={COLOR_TERTIARY} />
                          {ride.endLocation?.address || "No address"}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getRideStatusColor(ride.status).backgroundColor }]}>
                          <Text style={[styles.statusText, { color: getRideStatusColor(ride.status).color }]}>
                        {getRideStatusLabel(ride.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rideDetails}>
                        <View style={styles.detailRow}>
                          <FontAwesomeIcon icon={faCalendar} size={14} color={COLOR_TERTIARY} />
                          <Text style={styles.detailText}>{formatDate(ride.departureDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <FontAwesomeIcon icon={faClock} size={14} color={COLOR_TERTIARY} />
                          <Text style={styles.detailText}>{formatTime(ride.starttime)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <FontAwesomeIcon icon={faRoad} size={14} color={COLOR_TERTIARY} />
                          <Text style={styles.detailText}>{ride.totalDistance}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <FontAwesomeIcon icon={faUser} size={14} color={COLOR_TERTIARY} />
                          <Text style={styles.detailText}>
                          {user?._id === ride.driverId
                            ? `${ride.passengers?.length || 0} passengers`
                            : `${ride.pricePerSeat} Rs/seat`}
                          </Text>
                        </View>
                      </View>

                    {ride.status === "in_progress" && (
                        <View style={styles.liveTracking}>
                          <FontAwesomeIcon icon={faLocationDot} size={14} color={COLOR_PRIMARY} />
                          <Text style={styles.liveTrackingText}>Live tracking available</Text>
                        </View>
                    )}
                    </TouchableOpacity>
                  )
                ))}
              </ScrollView>
            )}
          </View>

          {/* Right panel: Selected ride details */}
          {selectedRide && (
            <View style={styles.selectedRideContainer}>
              {/* Back button (mobile only) */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedRide(null)}
              >
                <FontAwesomeIcon icon={faArrowRight} size={16} color="#2DBEFF" style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.backButtonText}>Back to list</Text>
              </TouchableOpacity>

              {/* Ride header */}
              <View style={styles.rideHeaderContainer}>
                <View>
                  <Text style={styles.rideTypeTitle}>
                    {selectedRide.rideType === "passenger" ? "Passenger Ride" :
                      selectedRide.rideType === "cargo" ? "Cargo Transport" :
                        "Mixed Transport"}
                  </Text>
                  <Text style={styles.rideDateTime}>
                    {formatDate(selectedRide.departureDate)} at {formatTime(selectedRide.starttime)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getRideStatusColor(selectedRide.status).backgroundColor }]}>
                  <Text style={[styles.statusText, { color: getRideStatusColor(selectedRide.status).color }]}>
                  {getRideStatusLabel(selectedRide.status)}
                  </Text>
                </View>
              </View>

              {/* Map for active ride - Note: You'll need to implement a React Native map component */}
              {selectedRide.status === "in_progress" && (
                <View style={styles.mapContainer}>
                  <Text style={styles.mapTitle}>Live Tracking</Text>
                  {isLoadingLocation ? (
                    <View style={styles.mapPlaceholder}>
                      <ActivityIndicator size="large" color="#2DBEFF" />
                      <Text style={styles.mapPlaceholderText}>Getting your location...</Text>
                    </View>
                  ) : currentLocation ? (
                    <MapView
                      style={styles.map}
                      provider={PROVIDER_GOOGLE}
                      region={mapRegion}
                      showsUserLocation={true}
                      showsMyLocationButton={true}
                      showsCompass={true}
                      showsScale={true}
                      onRegionChangeComplete={setMapRegion}
                    >
                      {/* Driver's current location marker */}
                      {driverLocation && (
                        <Marker
                          coordinate={{
                            latitude: driverLocation.coordinates[1],
                            longitude: driverLocation.coordinates[0]
                          }}
                          title="Driver Location"
                          description="Current driver position"
                        >
                          <View style={styles.driverMarker}>
                            <FontAwesomeIcon icon={faCar} size={20} color={COLOR_PRIMARY} />
                          </View>
                        </Marker>
                      )}

                      {/* Start location marker */}
                      <Marker
                        coordinate={{
                          latitude: selectedRide.startLocation.coordinates[1],
                          longitude: selectedRide.startLocation.coordinates[0]
                        }}
                        title="Pickup Location"
                        description={selectedRide.startLocation.address}
                        pinColor="#10B981"
                      />

                      {/* End location marker */}
                      <Marker
                        coordinate={{
                          latitude: selectedRide.endLocation.coordinates[1],
                          longitude: selectedRide.endLocation.coordinates[0]
                        }}
                        title="Dropoff Location"
                        description={selectedRide.endLocation.address}
                        pinColor="#EF4444"
                      />

                      {/* Route between start and end */}
                      <MapViewDirections
                        origin={{
                          latitude: selectedRide.startLocation.coordinates[1],
                          longitude: selectedRide.startLocation.coordinates[0]
                        }}
                        destination={{
                          latitude: selectedRide.endLocation.coordinates[1],
                          longitude: selectedRide.endLocation.coordinates[0]
                        }}
                        apikey="YOU GOOGLE_MAPS_API_KEY"
                        strokeWidth={3}
                        strokeColor="#2DBEFF"
                        optimizeWaypoints={true}
                        onReady={(result) => {
                          setRouteCoordinates(result.coordinates);
                        }}
                      />

                      {/* Passenger pickup/dropoff markers */}
                      {selectedRide.passengers && selectedRide.passengers.map((passenger, index) => (
                        <React.Fragment key={`passenger-${passenger._id || passenger.userId}-${index}`}>
                          {!passenger.cancelled && passenger.pickupPoint && (
                            <Marker
                              coordinate={{
                                latitude: passenger.pickupPoint.coordinates[1],
                                longitude: passenger.pickupPoint.coordinates[0]
                              }}
                              title={`${passenger.userDetails?.fullName || `Passenger ${index + 1}`} - Pickup`}
                              description={passenger.pickupPoint.address}
                              pinColor={passenger.pickedUp ? "#10B981" : "#F59E0B"}
                            />
                          )}
                          {!passenger.cancelled && passenger.dropoffPoint && (
                            <Marker
                              coordinate={{
                                latitude: passenger.dropoffPoint.coordinates[1],
                                longitude: passenger.dropoffPoint.coordinates[0]
                              }}
                              title={`${passenger.userDetails?.fullName || `Passenger ${index + 1}`} - Dropoff`}
                              description={passenger.dropoffPoint.address}
                              pinColor={passenger.droppedOff ? "#8B5CF6" : "#EF4444"}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </MapView>
                  ) : (
                    <View style={styles.mapPlaceholder}>
                      <FontAwesomeIcon icon={faMapLocationDot} size={40} color="#6B7280" />
                      <Text style={styles.mapPlaceholderText}>Location access required</Text>
                      <TouchableOpacity 
                        style={styles.enableLocationButton}
                        onPress={initializeLocation}
                      >
                        <Text style={styles.enableLocationButtonText}>Enable Location</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Route information */}
              <View style={styles.routeContainer}>
                <Text style={styles.sectionTitle}>Route</Text>
                <View style={styles.routeInfo}>
                  <View style={styles.routeLine}>
                  <View className=" bg-black  h-2 w-2 rounded-full "></View>
                  <View style={styles.routeLineConnector} />
                  <View className=" bg-black  h-2 w-2 rounded-full "></View>
                  </View>
                  <View style={styles.routeAddresses}>
                    <Text style={styles.routeAddress}>From: {selectedRide.startLocation.address}</Text>
                    <Text style={styles.routeAddressTo}>To: {selectedRide.endLocation.address}</Text>
                  </View>
                </View>
                <View style={styles.routeStats}>
                  <View style={styles.routeStat}>
                    <Text style={styles.routeStatLabel}>Distance</Text>
                    <Text style={styles.routeStatValue}>{selectedRide.totalDistance}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Text style={styles.routeStatLabel}>Duration</Text>
                    <Text style={styles.routeStatValue}>{selectedRide.totalDuration}</Text>
                  </View>
                </View>
              </View>

              {/* Driver/passenger info */}
              {(() => {
                const isPassenger = selectedRide?.passengers?.some(passenger => passenger.userId === user?._id);
                return isPassenger && selectedRide.driverId && (
                  <View style={styles.driverContainer}>
                    <Text style={styles.sectionTitle}>Driver</Text>
                    <View style={styles.driverInfo}>
                      <View style={styles.driverAvatar}>
                        {selectedRide?.driverDetails.profilePicture ? (
                          <Image
                            source={{ uri: selectedRide?.driverDetails.profilePicture }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUserAlt} size={20} color={COLOR_TERTIARY} />
                        )}
                      </View>
                      <View style={styles.driverDetails}>
                        <Text style={styles.driverName}>{selectedRide.driverDetails.fullName || "Driver"}</Text>
                          {selectedRide.driverDetails.isVerified && (
                          <View style={styles.verifiedContainer}>
                            <FontAwesomeIcon icon={faCheckCircle} size={14} color="#10B981" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                          )}
                      </View>
                      {selectedTab === 'past' && (
                        <TouchableOpacity style={styles.reviewButton} onPress={() => router.push({ pathname: '/(screen)/RiderRating', params: { userId: selectedRide?.driverDetails?._id, rideId: selectedRide?._id, reviewerRole: 'passenger' } })}>
                          <Text style={styles.reviewButtonText}>Leave a Review</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })()}

              {user?._id === selectedRide.driverId && selectedRide.passengers && (
              <  View style={styles.passengersContainer}>
                  <Text style={styles.sectionTitle}>Passengers ({selectedRide.passengers.length})</Text>
                  <ScrollView  style={styles.passengersList}>
                    {selectedRide.passengers.map((passenger, index) => (
                      <View key={`passenger-${passenger._id || passenger.userId}-${index}`} style={styles.passengerCard}>
                        <View  style={styles.passengerInfo}>
                          <View style={styles.passengerAvatar}>
                              {passenger?.userDetails?.profilePicture ? (
                              <Image
                                source={{ uri: passenger?.userDetails.profilePicture }}
                                style={styles.avatarImage}
                                />
                              ) : (
                              <View style={styles.avatarPlaceholder}>
                                <FontAwesomeIcon icon={faUserAlt} size={16} color={COLOR_TERTIARY} />
                              </View>
                              )}
                          </View>
                          <View style={styles.passengerDetails}>
                            <Text style={styles.passengerName}>
                            {passenger.userDetails?.fullName || `Passenger ${index + 1}`}
                            </Text>
                              {selectedRide?.rideType === 'passenger' && (
                                <>
                                <Text style={styles.passengerDetail}>
                                    Seats Booked: {passenger?.seatsBooked ?? `Passenger ${index + 1}`}
                                </Text>
                                <Text style={styles.passengerDetail}>
                                    Amount Paid: {passenger?.amountPaid ?? `Passenger ${index + 1}`}
                                </Text>
                                </>
                              )}
                              {selectedRide?.rideType === 'cargo' && (
                                <>
                                <Text style={styles.passengerDetail}>
                                    Cargo Booked: {passenger?.cbm || passenger?.cargoSpaceBooked ? passenger?.cbm || passenger?.cargoSpaceBooked : `Cargo ${index + 1}`}
                                </Text>
                                <Text style={styles.passengerDetail}>
                                    Amount Paid: {passenger?.amountPaid ?? `Cargo ${index + 1}`}
                                </Text>
                                </>
                              )}
                              {selectedRide?.rideType === 'mixed' && (
                                <>
                                  {passenger?.seatsBooked && (
                                  <Text style={styles.passengerDetail}>
                                      Seats Booked: {passenger.seatsBooked}
                                  </Text>
                                  )}
                                  {(passenger?.cbm || passenger?.cargoSpaceBooked) && (
                                  <Text style={styles.passengerDetail}>
                                      Cargo Booked: {passenger.cbm || passenger.cargoSpaceBooked}
                                  </Text>
                                  )}
                                <Text style={styles.passengerDetail}>
                                    Amount Paid: {passenger?.amountPaid ?? `Passenger ${index + 1}`}
                                </Text>
                                </>
                              )}
                            <View style={styles.contactInfo}>
                                {passenger.userDetails?.email && (
                                <View style={styles.contactItem}>
                                  <FontAwesomeIcon icon={faEnvelope} size={12} color={COLOR_TERTIARY} />
                                  <Text style={styles.contactText}>{passenger.userDetails.email}</Text>
                                </View>
                                )}
                                {passenger.userDetails?.phoneNumber && (
                                <View style={styles.contactItem}>
                                  <FontAwesomeIcon icon={faPhone} size={12} color={COLOR_TERTIARY} />
                                  <Text style={styles.contactText}>{passenger.userDetails.phoneNumber}</Text>
                                </View>
                                )}
                            </View>
                              {/* Only show pickup/dropoff info if not cancelled */}
                              {!passenger.cancelled && (
                              <View style={styles.pickupDropoff} className="relative gap-4">
                                <View style={styles.locationItem}>
                                  <Text style={styles.locationText} numberOfLines={2}>
                                      {passenger.pickupPoint?.address || "Pickup"}
                                  </Text>
                                </View>
                                <View className="flex absolute top-1 -left-2 translate-y-1/2 flex-col items-center justify-center">
                                <View className=" bg-black  h-2 w-2 rounded-full "></View>
                                <View className="border border-black-600  h-7  "></View>
                                <View className="bg-black   h-2 w-2 rounded-full"></View>
                                </View>
                                <View style={styles.locationItem}>
                                  <Text style={styles.locationText} numberOfLines={2}>
                                      {passenger.dropoffPoint?.address || "Dropoff"}
                                  </Text>
                                </View>
                              </View>
                              )}
                          </View>
                          {selectedTab === 'past' && (
                            <TouchableOpacity style={styles.reviewButton} onPress={() => router.push({ pathname: '/(screen)/RiderRating', params: { userId: passenger?.userId, rideId: selectedRide?._id, reviewerRole: 'driver' } })}>
                              <Text style={styles.reviewButtonText}>Leave a Review</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View  style={styles.passengerActions}>
                          {/* Only show actions/status if not cancelled */}
                          {!passenger.cancelled ? (
                            selectedRide.status === "in_progress" && (
                              <>
                                {(passenger.pickedUp) ? (
                                  <View style={styles.statusIndicator}>
                                    <FontAwesomeIcon icon={faCheckCircle} size={14} color="#10B981" />
                                    <Text style={styles.statusText}>Picked up</Text>
                                  </View>
                                ) : (
                                  <>
                                    <InputOTPControlled value={value} setValue={setValue} />
                                    <TouchableOpacity
                                      style={[styles.actionButton, value.length !== 6 && styles.disabledButton]}
                                      disabled={value.length !== 6}
                                      onPress={(e) => {
                                        if (!socket) {
                                          Toast.show({
                                            type: 'error',
                                            text1: 'Connection issue. Please refresh the page.',
                                            position: 'bottom',
                                            visibilityTime: 4000,
                                            autoHide: true,
                                            topOffset: 30,
                                            bottomOffset: 40
                                          });
                                          return;
                                        }
                                        // Confirm pickup
                                        socket.emit("confirm_pickup", {
                                          rideId: selectedRide._id,
                                          passengerId: passenger.userId,
                                          driverId: user._id,
                                          otp: value
                                        }, (response) => {
                                          console.log("Confirm pickup response:", response);
                                          if (response && response.error) {
                                            Toast.show({
                                              type: 'error',
                                              text1: response.error || "Failed to confirm pickup. Please try again.",
                                              position: 'bottom',
                                              visibilityTime: 4000,
                                              autoHide: true,
                                              topOffset: 30,
                                              bottomOffset: 40
                                            });
                                          } else if (response && response.success) {
                                            Toast.show({
                                              type: 'success',
                                              text1: 'Passenger pickup confirmed!',
                                              position: 'bottom',
                                              visibilityTime: 4000,
                                              autoHide: true,
                                              topOffset: 30,
                                              bottomOffset: 40
                                            });

                                            // Update the passenger status in the UI without reloading
                                            const updatedPassengers = selectedRide.passengers.map(p => {
                                              if (p.userId === passenger.userId || p._id === passenger._id) {
                                                return {
                                                  ...p,
                                                  pickedUp: true,
                                                  pickupTime: new Date().toISOString()
                                                };
                                              }
                                              return p;
                                            });

                                            // Update the selected ride with the new passenger data
                                            const updatedRide = {
                                              ...selectedRide,
                                              passengers: updatedPassengers
                                            };

                                            // Update the selected ride state
                                            setSelectedRide(updatedRide);

                                            // Update the ride in the rides list
                                            setRides(prev => {
                                              const updatedActive = prev.active.map(r =>
                                                r._id === selectedRide._id ? updatedRide : r
                                              );

                                              return {
                                                ...prev,
                                                active: updatedActive
                                              };
                                            });
                                          }
                                        });
                                      }}
                                    >
                                      <Text style={styles.actionButtonText}>Confirm Pickup</Text>
                                    </TouchableOpacity>
                                  </>
                                )}

                                {(passenger.pickedUp) && !(passenger.droppedOff) && (
                                  <TouchableOpacity
                                    style={styles.dropoffButton}
                                    onPress={(e) => {
                                      if (!socket) {
                                        Toast.show({
                                          type: 'error',
                                          text1: 'Connection issue. Please refresh the page.',
                                          position: 'bottom',
                                          visibilityTime: 4000,
                                          autoHide: true,
                                          topOffset: 30,
                                          bottomOffset: 40
                                        });
                                        return;
                                      }
                                      // Confirm dropoff
                                      socket.emit("confirm_dropoff", {
                                        rideId: selectedRide._id,
                                        passengerId: passenger.userId,
                                        driverId: user._id
                                      }, (response) => {
                                        console.log("Confirm dropoff response:", response);
                                        if (response && response.error) {
                                          Toast.show({
                                            type: 'error',
                                            text1: response.error || "Failed to confirm dropoff. Please try again.",
                                            position: 'bottom',
                                            visibilityTime: 4000,
                                            autoHide: true,
                                            topOffset: 30,
                                            bottomOffset: 40
                                          });
                                        } else if (response && response.success) {
                                          Toast.show({
                                            type: 'success',
                                            text1: 'Passenger dropoff confirmed!',
                                            position: 'bottom',
                                            visibilityTime: 4000,
                                            autoHide: true,
                                            topOffset: 30,
                                            bottomOffset: 40
                                          });
                                          console.log('inside dropoff')
                                          // Update the passenger status in the UI without reloading
                                          const updatedPassengers = selectedRide.passengers.map(p => {
                                            if (p.userId === passenger.userId || p._id === passenger._id) {
                                              return {
                                                ...p,
                                                droppedOff: true,
                                                dropoffTime: new Date().toISOString()
                                              };
                                            }
                                            return p;
                                          });
                                          console.log('inside dropoff updated user')
                                          console.log('selectedRide', selectedRide)
                       
                                          // Update the selected ride with the new passenger data
                                          const updatedRide = {
                                            ...selectedRide,
                                            passengers: updatedPassengers
                                          };
                                          console.log('updatedRide passengers', updatedRide.passengers)

                                          // Update the selected ride state
                                          setSelectedRide(updatedRide);

                                          // Update the ride in the rides list
                                       

                                          // Check if all passengers are dropped off and update ride status if needed
                                          const allDroppedOff = updatedPassengers.every(p => p.droppedOff);
                                          console.log('allDroppedOff', allDroppedOff)
                                          if (allDroppedOff) {
                                            // Update the selected ride status to completed
                                            const completedRide = {
                                              ...selectedRide,
                                              status: 'completed',
                                            };
                                            setSelectedRide(completedRide);
                                            
                                            // Remove the ride from active rides and add to past rides
                                            setRides(prev => {
                                              const updatedActive = prev.active.filter(r => r._id !== selectedRide._id);
                                              const updatedPast = [...prev.past, completedRide];
                                              
                                              return {
                                                ...prev,
                                                active: updatedActive,
                                                past: updatedPast
                                              };
                                            });
                                            
                                            loadRides();
                                            Toast.show({
                                              type: 'success',
                                              text1: 'All passengers have been dropped off. Ride completed!',
                                              position: 'bottom',
                                              visibilityTime: 5000,
                                              autoHide: true,
                                              topOffset: 30,
                                              bottomOffset: 40
                                            });
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    <Text style={styles.dropoffButtonText}>Confirm Dropoff</Text>
                                  </TouchableOpacity>
                                )}

                                {(passenger.droppedOff) && (
                                  <View style={styles.statusIndicator}>
                                    <FontAwesomeIcon icon={faCheckCircle} size={14} color="#8B5CF6" />
                                    <Text style={styles.statusText}>Completed</Text>
                                  </View>
                                )}

                                {/* Add Cancel Passenger Ride button for driver */}
                                {user?._id === selectedRide.driverId &&
                                  !passenger.cancelled &&
                                  !passenger.droppedOff &&
                                  (selectedRide.status === "scheduled" ||
                                    selectedRide.status === "in_progress" ||
                                    selectedRide.status === "ongoing" ||
                                    selectedRide.status === "delayed" ||
                                    selectedRide.status === "rescheduled") && (!passenger.pickedUp) && (
                                    <TouchableOpacity
                                      style={styles.cancelButton}
                                      onPress={(e) => {
                                        if (!socket) {
                                          Toast.show({
                                            type: 'error',
                                            text1: 'Connection issue. Please refresh the page.',
                                            position: 'bottom',
                                            visibilityTime: 4000,
                                            autoHide: true,
                                            topOffset: 30,
                                            bottomOffset: 40
                                          });
                                          return;
                                        }
                                        const reason = prompt("Please provide a reason for cancelling this passenger's ride:");
                                        if (reason) {
                                          socket.emit("cancel_passenger_ride", {
                                            rideId: selectedRide._id,
                                            passengerId: passenger.userId,
                                            driverId: user._id,
                                            reason: reason
                                          }, (response) => {
                                            console.log("Cancel passenger ride response:", response);
                                            if (response && response.error) {
                                              Toast.show({
                                                type: 'error',
                                                text1: response.error || "Failed to cancel passenger ride. Please try again.",
                                                position: 'bottom',
                                                visibilityTime: 4000,
                                                autoHide: true,
                                                topOffset: 30,
                                                bottomOffset: 40
                                              });
                                            } else if (response && response.success) {
                                              Toast.show({
                                                type: 'success',
                                                text1: 'Passenger ride cancelled successfully!',
                                                position: 'bottom',
                                                visibilityTime: 4000,
                                                autoHide: true,
                                                topOffset: 30,
                                                bottomOffset: 40
                                              });

                                              // Update the passenger status in the UI without reloading
                                              const updatedPassengers = selectedRide.passengers.map(p => {
                                                if (p.userId === passenger.userId || p._id === passenger._id) {
                                                  return {
                                                    ...p,
                                                    cancelled: true,
                                                    cancellationReason: reason
                                                  };
                                                }
                                                return p;
                                              });

                                              // Update the selected ride with the new passenger data
                                              const updatedRide = {
                                                ...selectedRide,
                                                passengers: updatedPassengers
                                              };

                                              // Update the selected ride state
                                              setSelectedRide(updatedRide);

                                              // Update the ride in the rides list
                                              setRides(prev => {
                                                const updatedActive = prev.active.map(r =>
                                                  r._id === selectedRide._id ? updatedRide : r
                                                );
                                                const updatedScheduled = prev.scheduled.map(r =>
                                                  r._id === selectedRide._id ? updatedRide : r
                                                );

                                                return {
                                                  ...prev,
                                                  active: updatedActive,
                                                  scheduled: updatedScheduled
                                                };
                                              });

                                              // Reload rides to ensure all lists are up to date
                                              loadRides();
                                            }
                                          });
                                        }
                                      }}
                                    >
                                      <Text style={styles.cancelButtonText}>Cancel Passenger</Text>
                                    </TouchableOpacity>
                                  )}
                              </>
                            )
                          ) : (
                            <View style={styles.cancelledStatus}>
                              <FontAwesomeIcon icon={faBan} size={14} color="#EF4444" />
                              <Text style={styles.cancelledText}>Cancelled</Text>
                              {passenger.cancellationReason && (
                                <Text style={styles.cancellationReason}>
                                  Reason: {passenger.cancellationReason}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.actionButtonsContainer}>
                {/* Start Ride button (for drivers) */}
                {user?._id === selectedRide.driverId && (
                  selectedRide.status === "scheduled" ||
                  selectedRide.status === "delayed" ||
                  selectedRide.status === "rescheduled"
                ) && (
                    <TouchableOpacity
                      style={styles.startRideButton}
                      onPress={() => {
                        if (!socket) {
                          Toast.show({
                            type: 'error',
                            text1: 'Connection issue. Please refresh the page.',
                            position: 'bottom',
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40
                          });
                          return;
                        }
                        // Start the ride
                        socket.emit("start_ride", {
                          rideId: selectedRide._id,
                          driverId: user._id
                        }, (response) => {
                          // Callback function to handle response from server
                          console.log("Start ride response:", response);
                          if (response && response.error) {
                            Toast.show({
                              type: 'error',
                              text1: response.error || "Failed to start ride. Please try again.",
                              position: 'bottom',
                              visibilityTime: 4000,
                              autoHide: true,
                              topOffset: 30,
                              bottomOffset: 40
                            });
                          } else if (response && response.success) {
                            Toast.show({
                              type: 'success',
                              text1: 'Ride started successfully!',
                              position: 'bottom',
                              visibilityTime: 4000,
                              autoHide: true,
                              topOffset: 30,
                              bottomOffset: 40
                            });

                            // Update the ride status in the UI without reloading
                            const updatedRide = {
                              ...selectedRide,
                              status: "in_progress"
                            };

                            // Update the selected ride
                            setSelectedRide(updatedRide);

                            // Update the rides lists
                            setRides(prev => {
                              // Remove from scheduled list
                              const newScheduled = prev.scheduled.filter(r => r._id !== selectedRide._id);

                              // Add to active list
                              const newActive = [...prev.active, updatedRide];

                              return {
                                ...prev,
                                scheduled: newScheduled,
                                active: newActive
                              };
                            });

                            // Start sending location updates if user is driver
                            if (user?._id === selectedRide.driverId) {
                              startSendingLocationUpdates(selectedRide._id);
                            }
                          }
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faMapLocationDot} size={16} color="white" />
                      <Text style={styles.startRideButtonText}>Start Ride</Text>
                    </TouchableOpacity>
                  )}

                {/* Complete Ride button (for drivers) */}
                {user?._id === selectedRide.driverId && (
                  selectedRide.status === "in_progress" ||
                  selectedRide.status === "ongoing"
                )
                  &&
                  selectedRide.passengers.every(passenger => passenger.pickedUp && passenger.droppedOff)
                  && (
                    <TouchableOpacity
                      style={styles.completeRideButton}
                      onPress={() => {
                        if (!socket) {
                          Toast.show({
                            type: 'error',
                            text1: 'Connection issue. Please refresh the page.',
                            position: 'bottom',
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40
                          });
                          return;
                        }
                        // Complete the ride
                        socket.emit("complete_ride", {
                          rideId: selectedRide._id,
                          driverId: user._id
                        }, (response) => {
                          // Callback function to handle response from server
                          console.log("Complete ride response:", response);
                          if (response && response.error) {
                            Toast.show({
                              type: 'error',
                              text1: response.error || "Failed to complete ride. Please try again.",
                              position: 'bottom',
                              visibilityTime: 4000,
                              autoHide: true,
                              topOffset: 30,
                              bottomOffset: 40
                            });
                          } else if (response && response.success) {
                            Toast.show({
                              type: 'success',
                              text1: 'Ride completed successfully!',
                              position: 'bottom',
                              visibilityTime: 4000,
                              autoHide: true,
                              topOffset: 30,
                              bottomOffset: 40
                            });
                          }
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} size={16} color="white" />
                      <Text style={styles.completeRideButtonText}>Complete Ride</Text>
                    </TouchableOpacity>
                  )}

                {/* Cancel button */}
                {["scheduled", "in_progress", "ongoing", "delayed", "rescheduled"].includes(selectedRide.status) &&
                  !selectedRide.passengers.some((p) => p.pickedUp == true)
                  &&
                  (
                    <TouchableOpacity
                      style={styles.cancelRideButton}
                      onPress={() => {
                        if (!socket) {
                          Toast.show({
                            type: 'error',
                            text1: 'Connection issue. Please refresh the page.',
                            position: 'bottom',
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40
                          });
                          return;
                        }
                        // Check if passenger is already picked up
                        const passenger = selectedRide.passengers.find(p => p.userId === user._id);
                        if (passenger?.pickedUp) {
                          Toast.show({
                            type: 'error',
                            text1: 'Cannot cancel ride after being picked up.',
                            position: 'bottom',
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40
                          });
                          return;
                        }
                        const reason = prompt("Please provide a reason for cancellation:");
                        if (reason) {
                          socket.emit("cancel_ride", {
                            rideId: selectedRide._id,
                            userId: user._id,
                            reason: reason || "Cancelled by user"
                          }, (response) => {
                            console.log("Cancel ride response:", response);
                            loadRides();
                            if (response && response.error) {
                              Toast.show({
                                type: 'error',
                                text1: response.error || "Failed to cancel ride. Please try again.",
                                position: 'bottom',
                                visibilityTime: 4000,
                                autoHide: true,
                                topOffset: 30,
                                bottomOffset: 40
                              });
                            } else if (response && response.success) {
                              Toast.show({
                                type: 'success',
                                text1: 'Ride cancelled successfully.',
                                position: 'bottom',
                                visibilityTime: 4000,
                                autoHide: true,
                                topOffset: 30,
                                bottomOffset: 40
                              });
                            }
                          });
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faFlag} size={16} color="#EF4444" />
                      <Text style={styles.cancelRideButtonText}>Cancel Ride</Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          )}

          {/* Empty state when no ride is selected */}
          {!selectedRide && rides[selectedTab].length > 0 && (
            <View style={styles.emptySelectionContainer}>
              <FontAwesomeIcon icon={faCar} size={80} color="#D1D5DB" />
              <Text style={styles.emptySelectionText}>Select a ride to view details</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default Rides;