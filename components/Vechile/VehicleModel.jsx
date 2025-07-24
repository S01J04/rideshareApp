import React, { useState } from 'react'
import { View, Text, TextInput } from 'react-native';
import Button from '../button';

const VehicleModel = ({ vehicleModel, setVehicleModel, nextStep }) => {
    const [error, setError] = useState("");

    const handleModelChange = (text) => {
        setVehicleModel(text);

        // Clear error when user types
        if (error) setError("");
    };

    const handleSubmit = () => {
        // Validate model
        if (!vehicleModel || vehicleModel.trim().length < 2) {
            setError("Please enter a valid vehicle model");
            return;
        }

        // Proceed to next step
        nextStep();
    };

    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Enter Vehicle Model
            </Text>
            <View className="relative flex flex-col w-full mt-8">
                <TextInput
                    className={`h-15 bg-gray-100 rounded-l-xl flex-1 px-4 py-5 ${error ? "border border-red-500" : ""}`}
                    value={vehicleModel}
                    onChangeText={handleModelChange}
                    placeholder="Enter vehicle model (e.g., Corolla, Civic)"
                    autoCapitalize="words"
                />
                <Button
                    onPress={handleSubmit}
                    CN={{ bgcolor: "bg-primary", color: "text-white" }}
                    text="Submit"
                    disabled={!vehicleModel}
                />
            </View>

            {error ? (
                <Text className="text-red-500 mt-2 text-center">{error}</Text>
            ) : null}
        </View>
    );
}

export default VehicleModel