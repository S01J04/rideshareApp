import React, { useState } from 'react'
import { View, Text, TextInput } from 'react-native';
import Button from '../button';

// Note: We could add color validation against a list of common colors in the future

const VehicleColor = ({ vehicleColor, setVehicleColor, nextStep }) => {
    const [error, setError] = useState("");

    const handleColorChange = (text) => {
        setVehicleColor(text);

        // Clear error when user types
        if (error) setError("");
    };

    const handleSubmit = () => {
        // Validate color
        if (!vehicleColor || vehicleColor.trim().length < 2) {
            setError("Please enter a valid vehicle color");
            return;
        }

        // Proceed to next step
        nextStep();
    };

    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Select Vehicle Color
            </Text>
            <View className="relative flex flex-col  w-full mt-8">
                <TextInput
                    className={`h-15 bg-gray-100 rounded-l-xl flex-1 px-4 py-5 ${error ? "border border-red-500" : ""}`}
                    value={vehicleColor}
                    onChangeText={handleColorChange}
                    placeholder="Enter vehicle color (e.g., Black, Red)"
                    autoCapitalize="words"
                />
                <Button
                    onPress={handleSubmit}
                    CN={{ bgcolor: "bg-primary", color: "text-white" }}
                    text="Submit"
                    disabled={!vehicleColor}
                />
            </View>

            {error ? (
                <Text className="text-red-500 mt-2 text-center">{error}</Text>
            ) : null}
        </View>
    );
}

export default VehicleColor