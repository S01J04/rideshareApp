import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { CardField, useStripe, StripeProvider } from "@stripe/stripe-react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "@/redux/axiosInstance";

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = "YOUR KEY IS PLACED HERE";

const Wrapper = (props) => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <PaymentPage {...props} />
  </StripeProvider>
);

// Helper functions for fare calculation
const getFareAmount = (ride, segment) => {
  // Try to get fare from different possible locations
  if (segment?.fareText) {
    return parseFloat(segment.fareText) || 0;
  }

  if (ride?.matchedRoute?.calculatedFare) {
    return parseFloat(ride.matchedRoute.calculatedFare) || 0;
  }

  if (ride?.pricePerSeat) {
    return parseFloat(ride.pricePerSeat) || 0;
  }

  return 0;
};

const calculateBookingFee = (ride, segment) => {
  const fare = getFareAmount(ride, segment);
  return (fare * 0.1).toFixed(2); // 10% booking fee
};

const calculateTotalFare = (ride, segment, passengerCount) => {
  const fare = getFareAmount(ride, segment);
  return (fare * passengerCount).toFixed(2);
};

const PaymentPage = () => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const params = useLocalSearchParams();
  const [ride, setRide] = useState(null);
  const [segment, setSegment] = useState(null);
  const stripe = useStripe();

  // State for passenger details, contact, and payment
  const [passengers, setPassengers] = useState([{ firstName: "", lastName: "", type: "Adult (16 - 99 years)" }]);
  const [contact, setContact] = useState("");
  const [cardDetails, setCardDetails] = useState(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    console.log("Received params:", params);

    // Parse ride and segment data from params
    if (params.rideData) {
      try {
        const rideDataStr = Array.isArray(params.rideData)
          ? params.rideData[0]
          : params.rideData;

        console.log("Parsing ride data:", rideDataStr);
        const rideData = JSON.parse(rideDataStr);
        console.log("Parsed ride data:", rideData);
        setRide(rideData);
      } catch (error) {
        console.error("Error parsing ride data:", error);
        Toast.show({
          type: 'error',
          text1: 'Error loading ride data',
          text2: 'Please try again',
        });
      }
    } else {
      console.warn("No ride data received in params");
    }

    if (params.segment) {
      try {
        const segmentDataStr = Array.isArray(params.segment)
          ? params.segment[0]
          : params.segment;

        console.log("Parsing segment data:", segmentDataStr);
        const segmentData = JSON.parse(segmentDataStr);
        console.log("Parsed segment data:", segmentData);
        setSegment(segmentData);
      } catch (error) {
        console.error("Error parsing segment data:", error);
        Toast.show({
          type: 'error',
          text1: 'Error loading segment data',
          text2: 'Please try again',
        });
      }
    } else {
      console.warn("No segment data received in params");
    }
  }, [params.segment]);

  const addPassenger = () => {
    // Add passenger details to the state
    setPassengers([...passengers, { firstName: "", lastName: "", type: "Adult (16 - 99 years)" }]);
  };

  const handleSubmit = async () => {
    console.log("Pay with Card pressed"); // Add this

    // Prevent multiple submissions
    if (isBookingInProgress) {
      console.log('Booking already in progress, ignoring duplicate submission');
      return;
    }
    console.log("after booking multiple"); // Add this

    setLoading(true);
    setIsBookingInProgress(true);

    // Validate required fields
    if (!contact || !passengers.length || passengers.some(p => !p.firstName || !p.lastName)) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required fields',
      });
      setLoading(false);
      setIsBookingInProgress(false);
      return;
    }
    console.log("aValidate required fields"); // Add this

    console.log(stripe, cardDetails)
    if (!stripe || !cardDetails?.complete) {
      Toast.show({
        type: 'error',
        text1: 'Please complete card details',
      });
      setLoading(false);
      setIsBookingInProgress(false);
      console.log("stripe Validate required fields"); // Add this

      return;
    }
    console.log("stripe Validate required fields"); // Add this

    try {
      console.log('Stripe object:', stripe);
      console.log('Card details:', cardDetails);
      // Create payment method
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
        card: cardDetails,
        billingDetails: {
          email: contact,
          name: `${passengers[0].firstName} ${passengers[0].lastName}`
        },
      });
      console.log("payment method created"); // Add this

      if (error) {
        console.error('Payment Method Error:', error);
        Toast.show({
          type: 'error',
          text1: error.message,
        });
        setLoading(false);
        setIsBookingInProgress(false);
        return;
      }

      // Calculate total amount
      const totalAmount = parseFloat(calculateTotalFare(ride, segment, passengers.length));

      // Prepare booking data
      const bookingData = {
        rideId: ride._id,
        pickupPoint: ride.matchedRoute?.pickupPoint ? {
          lat: ride.matchedRoute.pickupPoint.coordinates?.[1] || 0,
          lng: ride.matchedRoute.pickupPoint.coordinates?.[0] || 0,
          address: ride.matchedRoute.pickupPoint.address || segment?.startAddress || ride?.pickup || "Unknown Address",
          cityName: ride.matchedRoute.pickupPoint.cityName ||
            ride.matchedRoute.pickupPoint.address?.split(',')[0] ||
            segment?.startAddress?.split(',')[0] ||
            "Unknown City"
        } : {
          address: segment?.startAddress || ride?.pickup || "Unknown Address",
          cityName: segment?.startAddress?.split(',')[0] || "Unknown City"
        },
        dropoffPoint: ride.matchedRoute?.dropPoint ? {
          lat: ride.matchedRoute.dropPoint.coordinates?.[1] || 0,
          lng: ride.matchedRoute.dropPoint.coordinates?.[0] || 0,
          address: ride.matchedRoute.dropPoint.address || segment?.endAddress || ride?.drop || "Unknown Address",
          cityName: ride.matchedRoute.dropPoint.cityName ||
            ride.matchedRoute.dropPoint.address?.split(',')[0] ||
            segment?.endAddress?.split(',')[0] ||
            "Unknown City"
        } : {
          address: segment?.endAddress || ride?.drop || "Unknown Address",
          cityName: segment?.endAddress?.split(',')[0] || "Unknown City"
        },
        seatsBooked: passengers.length,
        bookingType: 'passenger',
        paymentMethodId: paymentMethod.id,
        totalAmount,
        segment,
        passengers: passengers.map(passenger => ({
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          type: passenger.type
        })),
        contact: {
          email: contact,
          name: `${passengers[0].firstName} ${passengers[0].lastName}`
        },
        status: 'pending',
        departureDate: ride.departureDate,
        departureTime: segment.departureTime,
        totalDuration: segment.durationText,
        arrivalTime: segment.arrivalTime
      };

      console.log('Sending booking data:', bookingData);
      // Send booking request to backend
      const response = await axiosInstance.post('/bookings/create-booking', bookingData);

      console.log('Booking response:', response.data);

      if (response.statusCode === 201) {
        const { clientSecret } = response.data;
        router.push({
          pathname: '/BookingConfirmationPage',
          params: {
            booking: JSON.stringify(response.data.booking), // must be string
            clientSecret: response.data.clientSecret,
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Error processing booking. Please try again.',
      });
      console.error('Payment Processing Error:', error);
    } finally {
      setLoading(false);
      setIsBookingInProgress(false);
    }
  };

  if (!ride || !segment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DBEFF" />
        <Text>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2DBEFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Toast />
        <View style={styles.mainContent}>
          {/* Passenger Details Section */}
          <View style={styles.detailsSection}>
            {/* Passenger Details */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Passenger details</Text>
              <View style={styles.passengerList}>
                {passengers.map((passenger, index) => (
                  <View key={index} style={styles.passengerRow}>
                    <TextInput
                      ref={index === 0 ? inputRef : null}
                      style={styles.input}
                      value={passenger.firstName}
                      onChangeText={(text) => {
                        const newPassengers = [...passengers];
                        newPassengers[index].firstName = text;
                        setPassengers(newPassengers);
                      }}
                      placeholder="First name*"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Last name*"
                      value={passenger.lastName}
                      onChangeText={(text) => {
                        const newPassengers = [...passengers];
                        newPassengers[index].lastName = text;
                        setPassengers(newPassengers);
                      }}
                    />
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={passenger.type}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                          const newPassengers = [...passengers];
                          newPassengers[index].type = itemValue;
                          setPassengers(newPassengers);
                        }}
                      >
                        <Picker.Item label="Adult (16 - 99 years)" value="Adult (16 - 99 years)" />
                        <Picker.Item label="Child (0 - 15 years)" value="Child (0 - 15 years)" />
                      </Picker>
                    </View>
                  </View>
                ))}

                <TouchableOpacity onPress={addPassenger} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add one more passenger</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.subText}>
                We will send your tickets to this email
              </Text>
              <TextInput
                style={[styles.input, styles.emailInput]}
                value={contact}
                onChangeText={setContact}
                placeholder="Email*"
                keyboardType="email-address"
              />
            </View>

            {/* Stripe Payment Method */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.cardStyle}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setCardDetails(cardDetails);
                }}
              />
            </View>
          </View>

          {/* Booking Details Section */}
          <View style={styles.bookingDetails}>
            <Text style={styles.sectionTitle}>Booking details</Text>
            <View style={styles.bookingSummary}>
              <View style={styles.tripDetails}>
                <Text style={styles.boldText}>
                  {ride?.departureDate ? new Date(ride.departureDate).toLocaleDateString() : "Date not available"}
                </Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>
                    {segment?.departureTime || "Departure time not available"}
                  </Text>
                  <Ionicons name="car" size={16} color="gray" style={styles.icon} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {segment?.startAddress || ride?.pickup || "Pickup location not available"}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>
                    {segment?.arrivalTime || "Arrival time not available"}
                  </Text>
                  <Ionicons name="car" size={16} color="gray" style={styles.icon} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {segment?.endAddress || ride?.drop || "Drop location not available"}
                  </Text>
                </View>
              </View>
              <Text style={styles.amendableText}>Amendable</Text>
            </View>

            <TouchableOpacity style={styles.tripDetailsButton}>
              <Ionicons name="map" size={16} color="#2DBEFF" />
              <Text style={styles.tripDetailsText}>See your Trip details</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.feeRow}>
              <Text style={styles.feeText}>Booking fee</Text>
              <Text style={styles.feeAmount}>
                Rs{calculateBookingFee(ride, segment)}
              </Text>
            </View>

            <View style={styles.termsRow}>
              <View style={styles.checkbox} />
              <Text style={styles.termsText}>
                I acknowledge and accept the Terms and conditions and any special conditions applicable to my reservation.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>
                Rs{calculateTotalFare(ride, segment, passengers.length)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payButton}
              // disabled={loading}
              onPress={handleSubmit}
            >
              <Ionicons name="card" size={20} color="white" />
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.payButtonText}>Pay with Card</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2DBEFF',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 40, // To offset the back button and center the title
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mainContent: {
    width: '100%',
  },
  detailsSection: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  passengerList: {
    gap: 12,
  },
  passengerRow: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  addButton: {
    marginTop: 8,
  },
  addButtonText: {
    color: '#2DBEFF',
    fontWeight: '600',
    fontSize: 14,
  },
  subText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  emailInput: {
    width: '100%',
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  bookingDetails: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingSummary: {
    marginBottom: 16,
  },
  tripDetails: {
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    color: '#666',
    fontSize: 14,
  },
  icon: {
    marginHorizontal: 4,
  },
  amendableText: {
    color: '#2DBEFF',
    fontSize: 14,
    marginTop: 8,
  },
  tripDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDetailsText: {
    color: '#2DBEFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feeText: {
    color: '#666',
    fontSize: 14,
  },
  feeAmount: {
    fontSize: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
    marginTop: 2,
  },
  termsText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  totalText: {
    fontWeight: '600',
    fontSize: 18,
  },
  totalAmount: {
    fontWeight: '600',
    fontSize: 18,
  },
  payButton: {
    backgroundColor: '#2DBEFF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Wrapper;
