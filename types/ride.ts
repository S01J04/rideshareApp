export type RideType = 'passenger' | 'cargo' | 'mixed';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Stop {
  cityName: string;
  location: Coordinates;
}

export interface Route {
  id: string;
  distance: string;
  duration: string;
  path: Coordinates[];
}

export interface CreateRideState {
  fromLocation: string;
  fromCoordinates: Coordinates | null;
  toLocation: string;
  toCoordinates: Coordinates | null;
  selectedDate: Date;
  selectedTime: Date;
  rideType: RideType;
  seats: number;
  cargoCapacity: number;
  pricePerSeat: number;
  priceCargoCapacity: number;
  amenities: Record<string, boolean>;
  instantBooking: boolean;
  selectedStops: Stop[];
  selectedRoute: Route | null;
  isLoading: boolean;
  error: string | null;
}

export interface RideValidation {
  isValid: boolean;
  message?: string;
}