import { useState } from "react";
import axiosInstance from "../axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, AxiosResponse } from 'axios';

interface RideData {
  instantBooking: boolean;
  amenities: Record<string, boolean>;
  driverId: string;
  vehicleId: string;
  fromCoordinates: { lat: number; lng: number };
  toCoordinates: { lat: number; lng: number };
  polyline?: string;
  fromLocation: string;
  toLocation: string;
  time: string;
  stops: any[];
  endtime: string;
  selectedDate: string;
  rideType: string;
  distance: string;
  duration: string;
  seats?: number;
  cargoCapacity?: number;
  pricePerSeat?: number;
  priceCargoCapacity?: number;
}

interface ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}

export const useCreateRide = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new ride.
   * @param {Object} rideData - The ride data to be sent to the server.
   * @returns {Object|null} - The response data if successful, otherwise null.
   */
  const createRide = async (rideData: RideData) => {
    if (!rideData || typeof rideData !== "object") {
      setError("Invalid ride data");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await axiosInstance.post<ApiResponse>("/rides/create-ride", rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Backend response from server:", response);
      
      // Check if the response has the expected structure
      if (response.success) {
        console.log("Ride Created:", response.message);
        return response;
      } else {
        throw new Error(response.data?.message || "Failed to create ride");
      }
    } catch (err) {
      console.error("Error creating ride:", err);
      const error = err as AxiosError<ApiResponse>;

      if (error.response) {
        setError(error.response.data?.message || "Failed to create ride");
      } else if (error.request) {
        setError("No response from the server. Please try again.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedRides = async (searchParams: Record<string, any>) => {
    if (!searchParams || typeof searchParams !== "object") {
      setError("Invalid search parameters");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await axiosInstance.get<ApiResponse>("/rides/fetch-rides", {
        params: {
          ...searchParams,
          _timestamp: new Date().getTime(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response:", response);
           
      if (response.statusCode !== 200) {
        throw new Error("Failed to fetch rides");
      }
      
      return response.data;
    } catch (err) {
      console.error("Error fetching rides:", err);
      const error = err as AxiosError<ApiResponse>;

      if (error.response) {
        setError(error.response.data?.message || "Failed to fetch rides");
      } else if (error.request) {
        setError("No response from the server. Please try again.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createRide, fetchRelatedRides, isLoading, error };
};