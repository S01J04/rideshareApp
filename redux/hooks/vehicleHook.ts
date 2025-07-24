import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../axiosInstance";
import { setVehicles } from "../slices/vechileSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const useVehicle = () => {
  const vehicles = useSelector((state) => state.vehicle.vehicles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // Generic API request handler
  const handleRequest = async (apiCall) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      return response;
    } catch (err) {
      console.error("Error:", err);
      setError(err.response ? err.response.data : err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const updatePreference = async (vehicleId) => {
    try {
      const data = await handleRequest(() => axiosInstance.patch(`/vehicles/update-preferences/${vehicleId}`));
      console.log(`Preference updated for vehicle: ${vehicleId}`);
      console.log(data.data)
      setVehicles(data.data);
      dispatch(setVehicles(data.data)); // Store in Redux
    } catch (err) {
      console.error("Error updating preference:", err);
      setError("Failed to update preference. Try again.");
    } 
  };
  // Fetch user's vehicles
  const fetchVehicles = useCallback(async () => {
    console.log("Fetching vehicles...");
    const storedVehicles = AsyncStorage.getItem("vehicles");
    console.log('Stored vehicles:', storedVehicles);
    if (storedVehicles && storedVehicles.length > 0) return; // Avoid unnecessary fetch
    console.log('Stored vehicles:', storedVehicles);
    try {
      console.log("Fetching vehicles... api call");
      const data = await handleRequest(() => axiosInstance.get(`/vehicles/fetchvehicles`));
      console.log("Fetched vehicles:", data.data);
      setVehicles(data.data);
      console.log( "data from fetch H0OK",data.data)
      dispatch(setVehicles(data.data)); // Store in Redux
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    }
  }, [dispatch]);
  

  // Add a new vehicle
  const addVehicle = async (vehicleData) => {
    try {
      const newVehicle = await handleRequest(() => axiosInstance.post("/vehicles", vehicleData));
      console.log("Vehicle added hook:", newVehicle.data);
      dispatch(setVehicles([...vehicles, newVehicle.data])); // Update Redux store
      return newVehicle;
    } catch (error) {
      console.error("Failed to add vehicle:", error);
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (vehicleId) => {
    try {
      await handleRequest(() => axiosInstance.delete(`/vehicles/${vehicleId}`));
      const updatedVehicles = vehicles.filter((v) => v._id !== vehicleId);
      dispatch(setVehicles(updatedVehicles));
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  // Update vehicle details
  const updateVehicle = async (vehicleId, updateData) => {
    try {
      const updatedVehicle = await handleRequest(() =>
        axiosInstance.put(`/vehicles/${vehicleId}`, updateData)
      );
      const updatedList = vehicles.map((v) => (v._id === vehicleId ? updatedVehicle : v));
      dispatch(setVehicles(updatedList));
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };


  return {
    vehicles,
    isLoading,
    error,
    fetchVehicles,
    updatePreference,
    addVehicle,
    deleteVehicle,
    updateVehicle,
  };
};
