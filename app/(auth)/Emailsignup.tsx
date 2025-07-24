import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import  Names  from "./GetNames";
import GetDOB from "./GetDOB";
import GetPassword from "./GetPassword";
import Headerbackbtn from "components/Headerbackbtn";
import { useRouter } from 'expo-router';
import axiosInstance from "@/redux/axiosInstance";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [showNameScreen, setShowNameScreen] = useState(false);
  const [currentstep,setcurrentstep]=useState(1)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create a ref for the email input
  const emailInputRef = useRef();

  useEffect(() => {
    // Focus on the email input when the component mounts
    emailInputRef.current?.focus();
  }, []); // Empty dependency array to ensure it runs only on mount

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 letter, 1 number, 1 special character
    return password.length >= 3;
  };

  const validateDOB = (dob: string) => {
    if (dob.length !== 8) return false; // DD/MM/YY format
    
    const day = parseInt(dob.slice(0, 2));
    const month = parseInt(dob.slice(3, 5));
    const year = parseInt('20' + dob.slice(6, 8));
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    return true;
  };

  const validateNames = (firstName: string, lastName: string) => {
    return firstName.trim().length >= 2 && lastName.trim().length >= 2;
  };

  const handleRegister = async () => {
    // Validate all fields
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!validateNames(firstName, lastName)) {
      Alert.alert("Invalid Names", "First and last names must be at least 2 characters long.");
      return;
    }

    if (!validateDOB(dob)) {
      Alert.alert("Invalid Date of Birth", "Please enter a valid date of birth in DD/MM/YY format.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Invalid Password", "Password must have at least 8 characters, 1 letter, 1 number, and 1 special character.");
      return;
    }

    setLoading(true);

    try {
      // Format DOB for API (convert DD/MM/YY to YYYY-MM-DD)
      const day = dob.slice(0, 2);
      const month = dob.slice(3, 5);
      const year = '20' + dob.slice(6, 8);
      const formattedDOB = `${year}-${month}-${day}`;

      const registrationData = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateofbirth: formattedDOB,
        password: password,
      };

      console.log("Registering user with data:", registrationData);

      const response = await axiosInstance.post("/users/phoneregister", registrationData);
      
      console.log("Registration successful:", response.data);
      
      Alert.alert(
        "Registration Successful", 
        "Your account has been created successfully! Please log in.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(auth)/login")
          }
        ]
      );

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "An account with this email already exists.";
      } else if (error.response?.status === 400) {
        errorMessage = "Please check your information and try again.";
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex flex-col h-full justify-between p-5">
       {  currentstep==1 &&   <View className=" flex flex-col h-full justify-between">
              <View><Headerbackbtn />
              <Text className="text-secondary font-semibold mt-8 text-3xl">What's your email?</Text>

              {/* Email Input */}
              <View className="mt-5">
                <View className="relative">
                  <TextInput
                    ref={emailInputRef} // Set the ref to the email input
                    className="bg-gray-200 text-secondary rounded-2xl py-5 px-4"
                    placeholder="Email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                  {email.length > 0 && (
                    <Ionicons
                      onPress={() => setEmail("")}
                      name="close-outline"
                      size={24}
                      color={"#6f8b90"}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: [{ translateY: -12 }],
                      }}
                    />
                  )}
                </View>
              </View>
              <Text className=" px-4 text-tertiary mt-10">
                By entering your email, you agree to our{" "}
                <Text className="text-primary">Terms and Conditions</Text> and{" "}
                <Text className="text-primary">Privacy Policy</Text>.{"\n\n"}
                Please make sure to read them carefully before proceeding.{"\n\n"}
                We value your privacy and ensure that your data is handled securely.{" "}
                For more information, visit our{" "}
                <Text className="text-primary">Help Center</Text> or contact{" "}
                <Text className="text-primary">Support</Text>.
              </Text></View>
              
               {/* Continue Button */}
            <View className="flex justify-end items-end">
              {email.length > 0 && validateEmail(email) && (
                <TouchableOpacity
                  onPress={() => setcurrentstep(currentstep+1)}
                  style={{ backgroundColor: "#2DBEFF", borderRadius: 50, padding: 10 }}
                  className="shadow-lg"
                >
                  <Text className="text-white text-xl font-bold">
                    <Ionicons name="chevron-forward-outline" size={23} />
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            </View>
            }
           {currentstep==2 && <Names 
           firstName={firstName} setFirstName={setFirstName}
           lastName={lastName} setLastName={setLastName}
           currentstep={currentstep} setcurrentstep={setcurrentstep}/>} 
           {currentstep==3 && <GetDOB dob={dob} setDob={setDob} currentstep={currentstep} setcurrentstep={setcurrentstep} />}
           {currentstep==4 && <GetPassword 
             password={password} 
             setPassword={setPassword}
             currentstep={currentstep} 
             setcurrentstep={setcurrentstep}
             onRegister={handleRegister}
             loading={loading}
           />}

           
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
