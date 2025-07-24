import * as SecureStore from 'expo-secure-store';

export const saveSecureItem = async (key, value) => {
  await SecureStore.setItemAsync(key, value);
};

export const getSecureItem = async (key) => {
  return await SecureStore.getItemAsync(key);
};

export const deleteSecureItem = async (key) => {
  await SecureStore.deleteItemAsync(key);
};
