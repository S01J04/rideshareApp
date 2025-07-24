import { createAsyncThunk } from "@reduxjs/toolkit";
import { saveSecureItem, getSecureItem, deleteSecureItem } from "../utils/SecureStoreHelper";
import { setAccessToken, setUser, logoutSuccess } from "./authSlice";
import axiosInstance from "@/redux/axiosInstance";

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  const response = await axiosInstance.post("/auth/login", credentials);

  await saveSecureItem("refreshToken", response.data.refreshToken);

  thunkAPI.dispatch(setAccessToken(response.data.accessToken));
  thunkAPI.dispatch(setUser(response.data.user));
});

export const refreshAccessToken = createAsyncThunk("auth/refresh", async (_, thunkAPI) => {
  const refreshToken = await getSecureItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await axiosInstance.post("/auth/refresh", { refreshToken });

  await saveSecureItem("refreshToken", response.data.refreshToken);

  thunkAPI.dispatch(setAccessToken(response.data.accessToken));
  thunkAPI.dispatch(setUser(response.data.user));
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  await deleteSecureItem("refreshToken");
  thunkAPI.dispatch(logoutSuccess());
});
