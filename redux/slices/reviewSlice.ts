import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// Thunk to fetch reviews
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (revieweeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/reviews", {
        params: { id: revieweeId },
      });
      console.log("fetching review",response)
      return response?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
export const fetchmyReviews = createAsyncThunk(
  "reviews/fetchmyReviews",
  async (revieweeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/reviews/my-reviews", {
        params: { id: revieweeId },
      });
      console.log("fetching review",response)
      return response?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchmyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchmyReviews.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchmyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default reviewsSlice.reducer;
