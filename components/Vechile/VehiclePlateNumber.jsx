import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import Button from '../button';

const VehiclePlateNumber = ({ vehiclePlateNumber, setvehiclePlateNumber, nextStep }) => {
    const [error, setError] = useState("");
    const [selectedState, setSelectedState] = useState("");

    const handleChange = (text) => {
        const input = text.toUpperCase(); // Convert input to uppercase
        setvehiclePlateNumber(input);

        // Clear error when user types
        if (error) setError("");
    };

    const handleSubmit = () => {
        // Validate plate number
        if (!vehiclePlateNumber || vehiclePlateNumber.trim().length < 3) {
            setError("Please enter a valid plate number (minimum 3 characters)");
            return;
        }

        // Proceed to next step
        nextStep();
    };

    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Enter Vehicle Plate number
            </Text>
            <View className="relative flex flex-col   w-full mt-8">
                <TextInput
                    className={`h-15 bg-gray-100 w-full  rounded-l-xl flex-1 px-4 py-5 ${error ? "border border-red-500" : ""}`}
                    value={vehiclePlateNumber}
                    onChangeText={handleChange}
                    placeholder="Enter vehicle plate number"
                    autoCapitalize="characters"
                />
             {VehiclePlateNumber.length > 0  &&  (   <Button
                    onPress={handleSubmit}
                    CN={{  bgcolor: "bg-primary", color: "text-white" }}
                    text="Submit"
                    disabled={!vehiclePlateNumber}
                />)}
            </View>

            {error ? (
                <Text className="text-red-500 mt-2 text-center">{error}</Text>
            ) : null}
        </View>
    );
};

export default VehiclePlateNumber;
