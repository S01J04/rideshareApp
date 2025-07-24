import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeVehicles } from '@/redux/slices/vechileSlice';
import { loadVehiclesFromStorage } from '@/redux/slices/vechileSlice';

/**
 * Component that loads vehicles from AsyncStorage and initializes the Redux store
 * This component doesn't render anything, it just performs the side effect
 */
const VehicleLoader: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicles = await loadVehiclesFromStorage();
        dispatch(initializeVehicles(vehicles));
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };

    loadVehicles();
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default VehicleLoader;
