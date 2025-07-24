import axiosInstance from 'redux/axiosInstance';
import { useLogout } from '../../redux/hooks/userHooks';
import { useVehicle } from 'redux/hooks/vehicleHook';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { useSelector } from 'react-redux';
import { updateProfile } from 'redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOutAlt, faUser, faStar, faLock, faCreditCard, faQuestionCircle, faFileAlt, faUserTimes } from '@fortawesome/free-solid-svg-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';


const Profile = () => {
  const [isAccountView, setIsAccountView] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const vehicle = useSelector(state => state.vehicle.vehicles);
  console.log(vehicle)
  const [loading, setLoading] = useState(false)
  const { updatePreference } = useVehicle()
  // Function to handle selection
  const handleSelectVehicle = async (vic) => {
    updatePreference(vic.plateNumber)
  };
  const dispatch =useDispatch()
  const handlepayment = async () => {
    try {
      setLoading(true);
      console.log("Starting Stripe account setup...");

      // Show loading toast
      Toast.show({
        type: 'info',
        text1: 'Setting up your payment account...',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // Make the API call
      const response = await axiosInstance.post("/payments/create-stripe-account");
      const responseData = response;
      console.log('responseData', responseData)
      // Check if we have a response
      if (!responseData) {
        throw new Error("No response received from server");
      }

      // Check if the response indicates success
      if (responseData.success === false) {
        throw new Error(responseData.message || "Failed to create Stripe account");
      }

      // Update user state if we have a Stripe account ID
      if (responseData.stripeAccountId) {
        console.log("Updating user with Stripe account ID:", responseData.stripeAccountId);

        // Update Redux store
        dispatch(updateProfile({
          stripeAccountId: responseData.stripeAccountId
        }));
      }

      // Redirect to Stripe onboarding if we have a URL
      if (responseData.url) {
        console.log("Stripe onboarding URL:", responseData.url);
        setLoading(false);

        // Show a success toast
        Toast.show({
          type: 'success',
          text1: 'Your Stripe account has been created!',
          text2: 'Please complete the verification process.',
          position: 'bottom',
          visibilityTime: 5000,
        });

        // Open URL in browser
        await Linking.openURL(responseData.url);

        // Show instructions toast
        Toast.show({
          type: 'info',
          text1: 'Please complete the verification in the new tab.',
          text2: 'Return to this page when finished.',
          position: 'bottom',
          visibilityTime: 10000,
        });

        return;
      } else {
        throw new Error("No onboarding URL provided by Stripe");
      }
    } catch (error: any) {
      console.error("Error creating Stripe account:", error);

      // Extract the error message
      let errorMessage = "An unknown error occurred";

      if (error.response?.data) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Failed to set up Stripe account',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const { logoutUser } = useLogout();
  const { user } = useSelector(state => state.user)
   const formattedDOB = useMemo(() => {
      if (!user?.dateofbirth) return null;
      const birthDate = new Date(user.dateofbirth);
      return `${birthDate.getDate()}-${birthDate.getMonth() + 1}-${birthDate.getFullYear()}`;
    }, [user?.dateofbirth]);
  console.log(user)
  const handlelogOut = async () => {
    setIsLoggingOut(true);
    try {
      // Show loading toast
      Toast.show({
        type: 'info',
        text1: 'Logging out...',
        position: 'bottom',
        visibilityTime: 2000,
      });

      await logoutUser();

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Logged out successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // After successful logout, redirect to login screen
      router.replace('/(auth)/login');
    } catch (err) {
      console.error("Logout failed:", err);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'There was a problem logging out. Please try again.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoggingOut(false);
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'right', 'left']}>
      {/* Top Switcher */}
      <View className='flex-row bg-white border-b border-gray-200'>
        {/* Profile Tab */}
        <TouchableWithoutFeedback onPress={() => setIsAccountView(false)}>
          <View className={`flex-1 items-center py-4 ${!isAccountView ? 'border-b border-secondary' : ''}`}>
            <Text className={`text-lg font-bold ${!isAccountView ? 'text-secondary' : 'text-gray-400'}`}>
              Profile
            </Text>
          </View>
        </TouchableWithoutFeedback>

        {/* Account Tab */}
        <TouchableWithoutFeedback onPress={() => setIsAccountView(true)}>
          <View className={`flex-1 items-center py-4 ${isAccountView ? 'border-b border-secondary' : ''}`}>
            <Text className={`text-lg font-bold ${isAccountView ? 'text-secondary' : 'text-gray-400'}`}>
              Account
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* Conditional View Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
      >
        {!isAccountView ? (
          <View className='flex flex-col gap-4'>
            <View className='bg-white flex flex-col px-6 py-6'>
              <TouchableOpacity onPress={() => router.push("/(screen)/(settings)/Userinfo")} className='flex flex-row items-center justify-between mb-4'>
                <View className='flex flex-row items-center'>
                  <View className="rounded-full border-2 border-primary h-20 w-20 overflow-hidden">
                    <Image
                      className="h-full w-full object-top rounded-full"
                      source={{ uri: user?.profilePicture }}
                    />
                  </View>
                  <View className="flex flex-col justify-center items-start pl-4">
                    <Text className="text-secondary text-2xl font-bold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.fullName || 'User'}
                    </Text>
                    <Text className="text-md text-gray-500">
                      {user?.role || 'User'}
                    </Text>
                    {user?.dateofbirth && (
                      <Text className="text-xs block text-gray-500">
                        Date of birth: {formattedDOB}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name='chevron-forward-outline' color={"#2DBEFF"} size={28} />
              </TouchableOpacity>

              <TouchableWithoutFeedback onPress={() => router.push("/(screen)/(settings)/Addprofileimg")}>
                <View className='flex flex-row items-center mb-4'>
                  <Ionicons name='add-circle-outline' size={18} color={"#2DBEFF"} />
                  <Text className='text-primary font-semibold text-md ml-2'>Add profile photo</Text>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => router.push("/(screen)/(settings)/editpersonaldetails")}>
                <View className='border-b border-gray-300 pb-4 mb-4'>
                  <Text className='text-primary font-semibold text-md'>Edit personal details</Text>
                </View>
              </TouchableWithoutFeedback>

              <View className='flex flex-col gap-4'>
                <Text className='text-secondary text-2xl font-bold'>Verify your profile</Text>
                {user?.emailverified ? (
                  <View className='flex flex-row items-center mb-3'>
                      <Ionicons name='checkmark-outline' size={24} color={"#2DBEFF"} />
                      <Text className='text-green-500 font-semibold text-lg ml-3'>Email verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => router.push("/(screen)/(settings)/verifyemail")} className='flex flex-row items-center mb-3'>
                    <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                    <Text className='text-primary font-semibold text-lg ml-3'>confirm email {'\n'}muhammad12345sohaib@gmail.com</Text>
                  </TouchableOpacity>
                )}

                {user?.Payoutenabled && user?.chargesenabled ? (
                  <View className="flex flex-row items-center mb-3">
                    <Text className="text-green-500">
                      <Ionicons name='checkmark-outline' size={24} color={"#2DBEFF"} />
                    </Text>
                    <Text className="text-green-500 text-start font-semibold text-sm ml-2">
                      Payment Verification Complete
                    </Text>
                  </View>
                ) : (
                  <View className="flex flex-row items-center mb-3">
                    <Text className="text-primary">
                      <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                    </Text>
                    <TouchableOpacity
                      onPress={handlepayment}
                      disabled={loading}
                      className="ml-2"
                    >
                      <Text className="text-primary text-start font-semibold text-sm">
                        {loading ? "Setting up..." : "Set Up Payout"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {user?.phoneVerified ? (
                  <View className='flex flex-row items-center mb-3'>
                    <Ionicons name='checkmark-circle' size={24} color={"#10B981"} />
                    <Text className='text-green-500 font-semibold text-lg ml-3'>Phone number verified</Text>
                  </View>
                ) : (
                  <View className='flex flex-row items-center'>
                    <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                    <Text className='text-primary font-semibold text-lg ml-3'>confirm phone number</Text>
                  </View>
                )}
              </View>
            </View>

            <View className='bg-white flex flex-col px-6 py-6'>
              <View className='flex flex-col border-b border-gray-300 pb-4 mb-4'>
                <Text className='text-secondary text-2xl font-bold mb-4'>About you</Text>
                <View className="text-md text-heading font-semibold mb-4">
                  <Text>{user?.bio && `"${user.bio}"`}</Text>
                </View>
                {!user?.bio && (
                  <TouchableWithoutFeedback onPress={() => router.push("/(screen)/(settings)/editbio")}>
                    <View className='flex flex-row items-center mb-4'>
                      <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                      <Text className='text-primary font-semibold text-lg ml-3'>Add a mini bio</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}

                <View className="space-y-3">
                  {user?.preferences.length > 0 && (
                    <Text className="text-secondary text-2xl font-semibold mb-4">Travel preferences</Text>
                  )}

                  {user?.preferences?.map((preference, index) => (
                    <View key={index} className="flex flex-row items-center py-2">
                      {preference?.category === "Chattiness" && preference?.selectedOption !== "No preference selected" && <FontAwesome name="comments" size={16} color="#2DBEFF" />}
                      {preference?.category === "Music" && preference?.selectedOption !== "No preference selected" && <FontAwesome name="music" size={16} color="#2DBEFF" />}
                      {preference?.category === "Smoking" && preference?.selectedOption !== "No preference selected" && <FontAwesome name="ban" size={16} color="#2DBEFF" />}
                      {preference?.category === "Pets" && preference?.selectedOption !== "No preference selected" && <FontAwesome name="paw" size={16} color="#2DBEFF" />}
                      <Text className="text-heading text-primary font-semibold ml-2">
                        {preference?.selectedOption !== "No preference selected" ? preference?.selectedOption : ``}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity onPress={() => router.push('/(screen)/(settings)/travelpreferences')} className='flex flex-row items-center mt-4'>
                  <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                  <Text className='text-primary font-semibold text-lg ml-3'>Edit travel preferences</Text>
                </TouchableOpacity>
              </View>

              <View className='flex flex-col gap-4'>
                <Text className='text-secondary text-2xl font-bold'>Vehicles</Text>
                {vehicle && (
                  <View className="my-4">
                    {vehicle.map((vic, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`flex flex-col w-full items-center p-3 rounded-2xl mb-3 ${vic.isPreferred ? "bg-gray-100" : ""}`}
                        onPress={() => handleSelectVehicle(vic)}
                      >
                        <View className="flex flex-row w-full items-center justify-between">
                          <View>
                            <Text className="block w-full font-bold text-lg text-heading">{vic?.model}</Text>
                            <Text className="text-gray-500">
                              <Text>{vic?.color}</Text>
                              <Text> • {vic?.vehicleType} • {vic?.year} • </Text>
                              <Text className="font-bold text-heading">{vic?.plateNumber}</Text>
                            </Text>
                          </View>
                          <View className="mr-3 w-5 h-5 border-2 border-primary rounded-lg items-center justify-center">
                            {vic.isPreferred && (
                              <View className="w-3 h-3 bg-primary rounded-lg" />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <TouchableOpacity onPress={() => router.push('/(screen)/(settings)/Vehicle')} className='flex flex-row items-center'>
                  <Ionicons name='add-circle-outline' size={24} color={"#2DBEFF"} />
                  <Text className='text-primary font-semibold text-lg ml-3'>Add Vehicle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className='flex flex-col gap-4'>
            <View className='bg-white px-6 py-6 flex flex-col'>
              <Text className='text-2xl font-bold text-secondary mb-4'>Account Settings</Text>

              <View className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'>
                <FontAwesomeIcon icon={faStar} size={24} color="#6f8b90" />
                <Text className='text-secondary font-semibold text-lg'>My Rating</Text>
              </View>

              <View className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'>
                <FontAwesomeIcon icon={faLock} size={24} color="#6f8b90" />
                <Text className='text-secondary font-semibold text-lg'>Change Password</Text>
              </View>

              <View className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'>
                <FontAwesomeIcon icon={faCreditCard} size={24} color="#6f8b90" />
                <Text className='text-secondary font-semibold text-lg'>Add Payment Method</Text>
              </View>

              <View className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'>
                <FontAwesomeIcon icon={faQuestionCircle} size={24} color="#6f8b90" />
                <Text className='text-secondary font-semibold text-lg'>Help & Support</Text>
              </View>

              <View className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'>
                <FontAwesomeIcon icon={faFileAlt} size={24} color="#6f8b90" />
                <Text className='text-secondary font-semibold text-lg'>Terms & Conditions</Text>
              </View>

              <TouchableOpacity
                onPress={() => handlelogOut()}
                disabled={isLoggingOut}
                className='flex flex-row items-center gap-3 border-b border-gray-200 pb-4 mb-4'
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#2DBEFF" />
                ) : (
                  <View className='flex flex-row items-center '>
                    <FontAwesomeIcon icon={faSignOutAlt} size={24} color="#6f8b90" />
                    <Text className='text-primary px-3 font-semibold text-lg'>Logout</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className='flex flex-row items-center gap-3'>
                <FontAwesomeIcon icon={faUserTimes} size={24} color="#6f8b90" />
                <Text className='text-primary font-semibold text-lg'>Close My Account</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
