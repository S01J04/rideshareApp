import axiosInstance from "../axiosInstance";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMaps = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to Get Location Suggestions
    const handleDestinationChange = async (e: { target: { value: string } }) => {
        console.log("Getting destination suggestions...");
        const inputValue = e.target.value;
        if (!inputValue) return [];

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axiosInstance.get(`/maps/get-suggestions`, {
                params: { input: inputValue },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("getting response",response); // ✅ Ensure this prints expected data
            return response?.data || response;  // ✅ Return suggestions correctly
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Function to Get Coordinates for Selected Location
    const getCoordinates = async (locationName: string) => {
        if (!locationName) return null;

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axiosInstance.get(`/maps/get-coordinates`, {
                params: { location: locationName },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Coordinates:", response); // ✅ Log the coordinates
            return response || null;
        } catch (err) {
            console.error("Error fetching coordinates:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { handleDestinationChange, getCoordinates, issuggestionsLoading: isLoading, error };
};
