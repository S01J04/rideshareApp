import { configureStore } from '@reduxjs/toolkit'
import { persistReducer,persistStore } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from 'redux'
import userReducer from './slices/userSlice'
import vehicleReducer from './slices/vechileSlice'
import searchReducer from "./slices/searchSlice"
import notificationReducer from './socketReducer'
import messageReducer from './slices/messageSlice'
import reviewReducer from './slices/reviewSlice'
import socketMiddleware from './middleware/socketMiddleware'

const rootReducer = combineReducers({
  user: userReducer,
  vehicle: vehicleReducer,
  search: searchReducer,
  notifications: notificationReducer,
  message: messageReducer,
  reviews: reviewReducer,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck:false}).concat(socketMiddleware),
})
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;