import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import Button from '../button';
import { useVehicle } from "@/redux/hooks/vehicleHook";
import { router } from "expo-router";

const ConfirmVehicle = ({ vehicleType, vehicleModel, vehiclePlateNumber, vehicleColor, vehicleYear, goBack }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addVehicle, isLoading } = useVehicle();

    const handleConfirm = async () => {
        if (!vehicleType || !vehiclePlateNumber || !vehicleModel || !vehicleColor || !vehicleYear) {
            Alert.alert("Missing Information", "Please fill in all the required fields.");
            return;
        }

        setIsSubmitting(true);

        const newVehicle = {
            vehicleType,
            plateNumber: vehiclePlateNumber,
            model: vehicleModel,
            color: vehicleColor,
            year: vehicleYear,
        };

        try {
            const response = await addVehicle(newVehicle);
            console.log("response from confirm vehicle", response);
            router.push("/profile");
        } catch (error) {
            console.error("Error adding vehicle:", error);
            Alert.alert("Error", "Failed to add vehicle.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const vehicleDetails = [
        { label: "Type", value: vehicleType },
        { label: "Plate Number", value: vehiclePlateNumber },
        { label: "Model", value: vehicleModel },
        { label: "Color", value: vehicleColor },
        { label: "Year", value: vehicleYear }
    ];

    return (
        <View className="flex-1 flex flex-col justify-start">
            <Text className="text-3xl w-full text-center font-semibold">
                Confirm Your Vehicle Details
            </Text>

            <View className="w-full p-6 mt-8">
                {vehicleDetails.map(({ label, value }) => (
                    <View key={label} className="flex flex-row justify-between pb-3 mb-3 border-b border-gray-200">
                        <Text className="font-semibold">{label}:</Text>
                        <Text>{value}</Text>
                    </View>
                ))}
            </View>

            <View className="flex  justify-center w-full mt-6">
                <Button
                    onPress={handleConfirm}
                    CN={{
                        bgcolor: "bg-primary",
                        color: "text-white"
                    }}
                    text={isSubmitting || isLoading ? "Saving..." : "Confirm & Proceed"}
                    loading={isSubmitting || isLoading}
                />
            </View>
        </View>
    );
};

export default ConfirmVehicle;
