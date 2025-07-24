import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import './globals.css';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import VehicleLoader from '@/components/VehicleLoader';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a context for authentication state
interface AuthContextType {
	user: any;
	setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export function useAuth() {
	return React.useContext(AuthContext);
}

// Auth provider component with navigation control
function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<any>(null);
	const router = useRouter();
	const segments = useSegments();

	// Get the current user from Redux store
	const currentUser = useSelector((state: any) => state.user?.user);

	// Update our state when Redux state changes
	useEffect(() => {
		if (currentUser) {
			setUser(currentUser);
		} else {
			setUser(null);
		}
	}, [currentUser]);

	// Handle routing based on authentication state
	useEffect(() => {
		const inAuthGroup = segments[0] === '(auth)';

		if (!user && !inAuthGroup) {
			// If user is not logged in and not in auth group, redirect to login
			router.replace('/(auth)/');
		} else if (user && inAuthGroup) {
			// If user is logged in and in auth group, redirect to home
			router.replace('/(tabs)/');
		}
	}, [user, segments]);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		// Add your custom fonts here if needed
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			// Hide splash screen once fonts are loaded or if there's an error
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	// Create a client for React Query
	const queryClient = new QueryClient();

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<QueryClientProvider client={queryClient}>
						<AuthProvider>
							<VehicleLoader />
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: { backgroundColor: 'white' },
									animation: 'slide_from_right'
								}}
							/>
						</AuthProvider>
					</QueryClientProvider>
				</PersistGate>
			</Provider>
			<Toast />
		</>
	);
}
