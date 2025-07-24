import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Button from '../button';
import { FontAwesome } from "@expo/vector-icons";

export const Vehicleyear = ({ vehicleYear, setVehicleYear, nextStep }) => {
    const [yearSuggestions, setYearSuggestions] = useState([]);

    // Sample static vehicle year options
    const vehicleYears = [];
    for (let year = 2025; year >= 1990; year--) {
        vehicleYears.push(year.toString());
    }

    // Handle User Input & Show Suggestions
    const handleYearChange = (text) => {
        setVehicleYear(text);

        if (text.length > 1) {
            const filteredYears = vehicleYears.filter(year =>
                year.startsWith(text)
            );
            setYearSuggestions(filteredYears);
        } else {
            setYearSuggestions([]);
        }
    };

    // When user selects a suggestion
    const selectVehicleYear = (year) => {
        setVehicleYear(year);
        setYearSuggestions([]); // Hide suggestions after selection
    };

    // Proceed to Next Step
    const handleSubmit = () => {
        if (!vehicleYear || !vehicleYears.includes(vehicleYear)) {
            Alert.alert("Invalid Year", "Please select a valid vehicle year.");
            return;
        }
        nextStep();
    };

    // Render a suggestion item
    const renderSuggestionItem = (item) => (
        <TouchableOpacity
            key={item}
            className="gap-6 px-5 rounded-xl py-2 w-[90%] flex flex-row items-center justify-between mx-auto mb-1"
            onPress={() => selectVehicleYear(item)}
        >
            <Text className="font-semibold">{item}</Text>
            <FontAwesome name="arrow-right" size={16} color="#2DBEFF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Enter Vehicle Year
            </Text>

            <View className="relative flex flex-col w-full mt-8">
                <TextInput
                    className="h-15 bg-gray-100 rounded-l-xl flex-1 px-4 py-5"
                    value={vehicleYear}
                    onChangeText={handleYearChange}
                    placeholder="Enter vehicle year (e.g., 2020)"
                    keyboardType="numeric"
                    maxLength={4}
                />
                <Button
                    onPress={handleSubmit}
                    CN={{ bgcolor: "bg-primary", color: "text-white" }}
                    text="Submit"
                    disabled={!vehicleYear || vehicleYear.length < 4}
                />
            </View>

            {/* Suggestions List */}
            {yearSuggestions.length > 0 && (
                <View className="my-2">
                    {yearSuggestions.slice(0, 5).map(item => renderSuggestionItem(item))}
                </View>
            )}
        </View>
    );
};