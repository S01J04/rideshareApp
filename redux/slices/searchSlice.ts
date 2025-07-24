import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pickup: "",
  drop: "",
  date: new Date().toISOString().split("T")[0], // Default to today
  passengers: 1,
  rideType: "passenger",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setPickup: (state, action) => { state.pickup = action.payload; },
    setDrop: (state, action) => { state.drop = action.payload; },
    setDate: (state, action) => {state.date = new Date(action.payload).toISOString().split("T")[0]; // ✅ Ensures YYYY-MM-DD format
    },
    setPassengers: (state, action) => { state.passengers = action.payload; },
    setRideType: (state, action) => { state.rideType = action.payload; },

  },
});

export const { setPickup, setDrop, setDate, setPassengers, setRideType, swapLocations } = searchSlice.actions;
export default searchSlice.reducer;
