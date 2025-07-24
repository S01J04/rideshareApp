import { io, Socket } from 'socket.io-client';
import { setSocketId, rideApprovalReceived, notificationReceived, notificationRead } from '../actions/socketAction';
import { updateProfile } from '../slices/userSlice';
import { addMessage, manualAddMessage } from '../slices/messageSlice';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

// Create a socket variable in the outer scope that can be exported
let socket: Socket | null = null;

// Determine the appropriate baseURL based on platform (same logic as axiosInstance)
const getBaseUrl = () => {
  // Use environment variable if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // For Android emulator, localhost refers to the emulator itself, not your machine
  if (Platform.OS === 'android') {
    return 'http://192.168.43.115:3000'; // Special IP for Android emulator to reach host
  }

  // For iOS simulator, localhost works but you might want to use your machine's IP
  // when testing on physical devices
  return 'http://192.168.43.115:3000';
};

// Create a custom event emitter for React Native
class CustomEventEmitter {
    private listeners: Map<string, Set<(data: any) => void>>;

    constructor() {
        this.listeners = new Map();
    }

    emit(event: string, data: any): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.forEach(callback => callback(data));
        }
    }

    on(event: string, callback: (data: any) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
        return () => this.listeners.get(event)?.delete(callback);
    }

    off(event: string, callback: (data: any) => void): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.delete(callback);
        }
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

// Create a global event emitter for React Native
export const socketEventEmitter = new CustomEventEmitter();

const socketMiddleware = (store: any) => {
    return (next: any) => (action: any) => {
        switch (action.type) {
            case 'SOCKET_INIT':
                if (!socket) {
                    const baseUrl = getBaseUrl();
                    console.log('Initializing socket connection to:', baseUrl);
                    
                    socket = io(baseUrl, {
                        transports: ['websocket', 'polling'], // Allow both transports for better compatibility
                        reconnection: true,
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        timeout: 20000, // 20 second timeout
                        forceNew: true, // Force new connection
                        extraHeaders: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET,POST"
                        }
                    });

                    socket.on('connect', () => {
                        console.log('✅ Connected to Socket.io:', socket?.id);
                        store.dispatch(updateProfile({ field: "socketId", value: socket?.id }));

                        // Get user details from state
                        const { user } = store.getState().user;
                        if (user && user?._id) {
                            console.log('🔗 Joining user room for:', user._id);
                            socket?.emit('join', { userId: user._id });
                        } else {
                            console.log('⚠️ No user found in state, skipping join');
                        }
                    });

                    socket.on('connect_error', (error) => {
                        console.error('❌ Socket connection error:', error);
                        console.error('🔍 Connection details:', {
                            url: baseUrl,
                            transports: ['websocket', 'polling'],
                            error: error.message
                        });
                    });

                    // Listen for ride approval events
                    socket.on('ride-approval', (data) => {
                        console.log('🚗 Ride approval received:', data);
                        store.dispatch(rideApprovalReceived(data));
                    });

                    // Listen for notifications
                    socket.on('new_notification', (notification) => {
                        console.log("📨 New notification received:", notification);
                        store.dispatch(notificationReceived(notification));
                    });

                    // Listen for notification read events
                    socket.on('notification_read', (data) => {
                        console.log("📖 Notification read event:", data);
                        store.dispatch(notificationRead(data?.notificationId));
                    });

                    // Listen for location updates
                    socket.on('location_updated', (data) => {
                        const { rideId, location } = data;
                        console.log(`📍 Location updated for ride ${rideId}:`, location);
                        socketEventEmitter.emit('location_updated', data);
                    });

                    socket.on('new_message', (data) => {
                        console.log("💬 New message received via socket:", data);
                        if (!data || !data.content) {
                            console.error("❌ Invalid message data received:", data);
                            return;
                        }
                        store.dispatch(manualAddMessage(data));
                    });

                    // Listen for chat created events
                    socket.on('chat_created', (data) => {
                        console.log("💭 Chat created event:", data);
                        socketEventEmitter.emit('chat_created', data);
                    });

                    // Listen for ride updates and trigger data refresh
                    socket.on('ride_update', (data) => {
                        console.log("🔄 Ride update received:", data);
                        // Emit event to trigger UI refresh
                        socketEventEmitter.emit('ride_update', data);
                    });

                    // Listen for ride status changes
                    socket.on('ride_started', (data) => {
                        console.log("🚀 Ride started event:", data);
                        socketEventEmitter.emit('ride_started', data);
                    });

                    socket.on('ride_completed', (data) => {
                        console.log("✅ Ride completed event:", data);
                        socketEventEmitter.emit('ride_completed', data);
                    });

                    socket.on('ride_cancelled', (data) => {
                        console.log("❌ Ride cancelled event:", data);
                        socketEventEmitter.emit('ride_cancelled', data);
                    });

                    socket.on('disconnect', (reason) => {
                        console.log('🔌 Disconnected from Socket.io, reason:', reason);
                    });

                    socket.on('reconnect', (attemptNumber) => {
                        console.log('🔄 Reconnected to Socket.io, attempt:', attemptNumber);
                        const { user } = store.getState().user;
                        if (user && user?._id) {
                            socket?.emit('join', { userId: user._id });
                        }
                    });

                    socket.on('reconnect_error', (error) => {
                        console.error('❌ Socket reconnection error:', error);
                    });
                }
                break;

            case 'REQUEST_RIDE_APPROVAL':
                if (socket) {
                    socket.emit('request-ride-approval', action.payload);
                }
                break;

            case 'SEND_RIDE_APPROVAL':
                if (socket) {
                    socket.emit('ride-approval', action.payload);
                }
                break;

            case 'JOIN_ROOM':
                if (socket) {
                    const { roomId } = action.payload;
                    console.log(`Joining room: ${roomId}`);
                    socket.emit('join_room', { roomId });
                }
                break;

            case 'LEAVE_ROOM':
                if (socket) {
                    const { roomId } = action.payload;
                    console.log(`Leaving room: ${roomId}`);
                    socket.emit('leave_room', { roomId });
                }
                break;

            case 'UPDATE_LOCATION':
                if (socket) {
                    socket.emit('update_location', action.payload);
                }
                break;

            case 'SOCKET_DISCONNECT':
                if (socket) {
                    socket.disconnect();
                    socket = null;
                }
                break;

            case 'SEND_MESSAGE':
                if (socket) {
                    const { chatRoomId, content } = action.payload;
                    console.log(`Sending message to room: ${chatRoomId}`);
                    socket.emit('send_message', { chatRoomId, content });
                }
                break;

            default:
                break;
        }

        return next(action);
    };
};

// Export the socket instance so it can be used in components
export { socket };

export default socketMiddleware;
