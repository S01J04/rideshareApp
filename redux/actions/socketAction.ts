export const initializeSocket = () => ({
    type: 'SOCKET_INIT'
});

export const setSocketId = (socketId) => ({
    type: 'SET_SOCKET_ID',
    payload: socketId
});

export const requestRideApproval = (rideData) => ({
    type: 'REQUEST_RIDE_APPROVAL',
    payload: rideData
});

export const rideApprovalReceived = (data) => ({
    type: 'RIDE_APPROVAL_RECEIVED',
    payload: data
});

export const sendRideApproval = (rideData) => ({
    type: 'SEND_RIDE_APPROVAL',
    payload: rideData
});

export const joinRoom = (roomId) => ({
    type: 'JOIN_ROOM',
    payload: roomId
});

export const leaveRoom = (roomId) => ({
    type: 'LEAVE_ROOM',
    payload: roomId
});

export const updateLocation = (locationData) => ({
    type: 'UPDATE_LOCATION',
    payload: locationData
});

export const locationUpdated = (data) => ({
    type: 'LOCATION_UPDATED',
    payload: data
});

export const notificationReceived = (data) => ({
    type: 'NOTIFICATION_RECEIVED',
    payload: data
});

export const notificationRead = (notificationId) => ({
    type: 'NOTIFICATION_READ',
    payload: { notificationId }
});

export const notificationReadAll = () => ({
    type: 'NOTIFICATION_READ_ALL'
});

export const clearNotifications = () => ({
    type: 'CLEAR_NOTIFICATIONS'
});

export const disconnectSocket = () => ({
    type: 'SOCKET_DISCONNECT'
});

export const removeNotification = (bookingId) => ({
    type: 'REMOVE_NOTIFICATION',
    payload: bookingId
});
