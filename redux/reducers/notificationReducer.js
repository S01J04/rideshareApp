const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NOTIFICATION_RECEIVED':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        )
      };
    case 'NOTIFICATION_READ_ALL':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        )
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};
