export const notificationReceived = (data) => ({
    type: 'NOTIFICATION_RECEIVED',
    payload: data
});

export const notificationRead = (notificationId) => ({
    type: 'NOTIFICATION_READ',
    payload: { notificationId }
});

export const clearNotifications = () => ({
    type: 'CLEAR_NOTIFICATIONS'
}); 