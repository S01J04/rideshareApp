
# My Expo Rideshare App

A full-featured ridesharing application built with React Native (Expo), Redux, Socket.IO, and Google Maps. This project supports both drivers and passengers, providing real-time ride tracking, booking, and management features.

## Features

- User authentication (login, signup, password management)
- Book rides as a passenger or offer rides as a driver
- Real-time ride status updates via Socket.IO
- Live location tracking for drivers and passengers
- Google Maps integration for route and stop visualization
- Ride scheduling, active ride management, and ride history
- In-app notifications and ride status toasts
- Review and rating system for drivers and passengers
- Modular component structure for easy maintenance

## Project Structure

```
my-expo-app/
├── app/                # Main app screens and navigation
│   ├── (auth)/         # Authentication screens
│   ├── (screen)/       # Main ride-related screens
│   ├── (tabs)/         # Tab navigation and ride lists
│   ├── chat/           # Chat feature
│   ├── home/           # Home screen
│   ├── rides/          # Rides logic
│   ├── search/         # Search rides
│   ├── settings/       # User settings
│   └── utils/          # Utility functions
├── assets/             # Images and static assets
├── components/         # Reusable UI components
├── constants/          # App-wide constants
├── hooks/              # Custom React hooks
├── lib/                # Library code
├── redux/              # Redux store, actions, reducers, middleware
├── services/           # API service modules
├── types/              # TypeScript types
├── utils/              # Utility functions
├── app.json            # Expo app configuration
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS config
└── ...                 # Other config and environment files
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Google Maps API Key (for map features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/my-expo-app.git
   cd my-expo-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Create a `.env` file if needed for API endpoints, Google Maps API key, etc.
   - Update `app/(tabs)/rides.tsx` and other files with your Google Maps API key.

4. **Start the Expo development server:**
   ```bash
   expo start
   ```

5. **Run on your device or emulator:**
   - Use the Expo Go app (iOS/Android) or an emulator to preview the app.

### Backend/API
- This app expects a backend server with REST API endpoints for authentication, rides, and real-time updates via Socket.IO.
- Update `redux/axiosInstance.ts` and socket configuration with your backend URLs.

## Key Technologies
- **React Native (Expo)**: Cross-platform mobile development
- **Redux**: State management
- **Socket.IO**: Real-time communication
- **Google Maps**: Route and location visualization
- **Tailwind CSS**: Utility-first styling (via NativeWind)
- **TypeScript**: Type safety

## Scripts
- `npm start` / `expo start` — Start the Expo development server
- `npm run android` — Run on Android emulator/device
- `npm run ios` — Run on iOS simulator/device
- `npm run web` — Run in web browser
- `npm run lint` — Lint code
- `npm run format` — Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Acknowledgements
- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Redux](https://redux.js.org/)
- [Socket.IO](https://socket.io/)
- [Google Maps Platform](https://developers.google.com/maps)
- [NativeWind](https://www.nativewind.dev/)

---

For any questions or issues, please open an issue on GitHub.
