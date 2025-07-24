import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our state
interface User {
  [key: string]: any;
}

interface Coordinates {
  [key: string]: any;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  coordinates: Coordinates | null;
}

// Helper function to save data to AsyncStorage
const saveToStorage = async (key: string, value: any) => {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    }
  } catch (error) {
    console.error(`Error saving ${key} to AsyncStorage:`, error);
  }
};

// Define types for the thunk parameters
interface ProfileUpdate {
  field?: string;
  value?: any;
  [key: string]: any;
}

// ✅ Thunk to update profile picture in Redux
export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async (profilePicture: string, { getState }) => {
    const state = getState() as { user: UserState };
    const user = state?.user?.user as User;
    const updatedUser = { ...user, profilePicture }; // Update only image field
    await saveToStorage("user", updatedUser);
    return updatedUser;
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (updates: ProfileUpdate, { getState }) => {
    const state = getState() as { user: UserState };
    const user = state?.user?.user as User;
    console.log("Updating user profile:", updates);

    // Handle both single field updates and multiple field updates
    let updatedUser: User;
    if (updates.field && updates.value !== undefined) {
      // Single field update (backward compatibility)
      updatedUser = { ...user, [updates.field]: updates.value };
    } else {
      // Multiple field updates
      updatedUser = { ...user, ...updates };
    }

    await saveToStorage("user", updatedUser);
    return updatedUser;
  }
);

// ✅ Thunk to update coordinates
export const updateCoordinates = createAsyncThunk(
  "user/updateCoordinates",
  async (coordinates: Coordinates) => {
    console.log("Updating coordinates:", coordinates);
    await saveToStorage("coordinates", coordinates);
    return coordinates; // Return the new coordinates
  }
);



// Initial state with empty values - will be populated by redux-persist
const initialState: UserState = {
  user: null,
  accessToken: null,
  coordinates: null,
};

// Helper function to load initial data (can be used in app initialization)
export const loadInitialUserData = async () => {
  try {
    const userJson = await AsyncStorage.getItem("user");
    const accessToken = await AsyncStorage.getItem("accessToken");
    const coordinatesJson = await AsyncStorage.getItem("coordinates");

    return {
      user: userJson ? JSON.parse(userJson) : null,
      accessToken: accessToken || null,
      coordinates: coordinatesJson ? JSON.parse(coordinatesJson) : null,
    };
  } catch (error) {
    console.error("Error loading user data from AsyncStorage:", error);
    return initialState;
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log("Setting user in Redux:", action.payload);
      state.user = action.payload;
      saveToStorage("user", action.payload); // Persist user with AsyncStorage
    },
    setAccessToken: (state, action) => {
      console.log("Setting access token:", action.payload);
      state.accessToken = action.payload;
      saveToStorage("accessToken", action.payload); // Persist token with AsyncStorage
    },
    logoutUser: (state) => {
      console.log("Logging out user");
      state.user = null;
      state.accessToken = null;

      // Clear storage on logout using AsyncStorage
      saveToStorage("user", null);
      saveToStorage("accessToken", null);
      saveToStorage("vehicles", null);
      saveToStorage("search", null);
      saveToStorage("coordinates", null);
      // Note: persist:root will be handled by redux-persist configuration
    },
  },
  extraReducers: (builder) => { // ✅ Move this outside reducers
    builder.addCase(updateProfilePicture.fulfilled, (state, action) => {
      console.log("Updating user profile picture in Redux:", action.payload);
      state.user = action.payload;
      // AsyncStorage is already handled in the thunk
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      console.log("Updating user profile in Redux:", action.payload);

      // ✅ Merge only the updated field
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = action.payload;
      }

      // AsyncStorage is already handled in the thunk
    });
    builder.addCase(updateCoordinates.fulfilled, (state, action) => {
      console.log("Updating coordinates in Redux:", action.payload);
      state.coordinates = action.payload;
      // AsyncStorage is already handled in the thunk
    });
  },
});

export const { setUser, logoutUser, setAccessToken } = userSlice.actions;
export default userSlice.reducer;
