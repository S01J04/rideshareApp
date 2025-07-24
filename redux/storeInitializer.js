/**
 * This file ensures the Redux store is properly initialized before it's used
 */

import { store } from './store';

// Create a mock store in case the real store fails to initialize
const createMockStore = () => {
  return {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {},
    replaceReducer: () => {}
  };
};

// Initialize store immediately
let storeInitialized = false;
let safeStore = store;

// Force store initialization
const initializeStore = () => {
  if (!storeInitialized) {
    // Access getState to ensure store is fully initialized
    try {
      // Try to access getState to verify the store is working
      const state = store.getState();
      storeInitialized = true;
      console.log('Redux store initialized successfully');
      safeStore = store;
    } catch (error) {
      console.error('Error initializing Redux store:', error);
      // If there's an error, use a mock store to prevent crashes
      safeStore = createMockStore();
    }
  }
  return safeStore;
};

// Initialize immediately
initializeStore();

export default initializeStore;
