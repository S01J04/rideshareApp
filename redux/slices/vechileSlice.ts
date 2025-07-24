import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Vehicle {
  _id?: string;
  vehicleType: string;
  plateNumber: string;
  model: string;
  color: string;
  year: string;
  isPreferred?: boolean;
}

interface VehicleState {
  vehicles: Vehicle[];
  error: string | null;
  loading: boolean;
}

// Helper function to save vehicles to AsyncStorage
const saveVehiclesToStorage = async (vehicles: Vehicle[]) => {
  try {
    await AsyncStorage.setItem("vehicles", JSON.stringify(vehicles));
  } catch (error) {
    console.error("Error saving vehicles to AsyncStorage:", error);
    throw error;
  }
};

// Thunk to add a vehicle
export const addVehicle = createAsyncThunk(
  "vehicle/addVehicle",
  async (vehicle: Vehicle, { getState }) => {
    try {
      const { vehicles } = (getState() as { vehicle: VehicleState }).vehicle;
      const updatedVehicles = [...vehicles, vehicle];
      await saveVehiclesToStorage(updatedVehicles);
      return updatedVehicles;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw error;
    }
  }
);

// Thunk to remove a vehicle
export const removeVehicle = createAsyncThunk(
  "vehicle/removeVehicle",
  async (plateNumber: string, { getState }) => {
    try {
      const { vehicles } = (getState() as { vehicle: VehicleState }).vehicle;
      const updatedVehicles = vehicles.filter(vehicle => vehicle.plateNumber !== plateNumber);
      await saveVehiclesToStorage(updatedVehicles);
      return updatedVehicles;
    } catch (error) {
      console.error("Error removing vehicle:", error);
      throw error;
    }
  }
);

// Function to load vehicles from AsyncStorage
export const loadVehiclesFromStorage = async (): Promise<Vehicle[]> => {
  try {
    const vehiclesJson = await AsyncStorage.getItem('vehicles');
    if (vehiclesJson) {
      return JSON.parse(vehiclesJson);
    }
    return [];
  } catch (error) {
    console.error("Error loading vehicles from AsyncStorage:", error);
    return [];
  }
};

// Initial state
const initialState: VehicleState = {
  vehicles: [],
  error: null,
  loading: false
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
      saveVehiclesToStorage(action.payload).catch(error => {
        state.error = error.message;
      });
    },
    initializeVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add vehicle';
      })
      .addCase(removeVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(removeVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove vehicle';
      });
  },
});

export const { setVehicles, initializeVehicles, clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
