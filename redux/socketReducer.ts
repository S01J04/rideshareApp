const initialState = {
    notifications: []
};

const socketReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SOCKET_ID':
            return { ...state, socketId: action.payload };
        
        case 'NOTIFICATION_RECEIVED':
            return {
                ...state,
                notifications: [action.payload, ...state.notifications]
            };

        case 'NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(notification =>
                    notification._id === action.payload.notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            };
        case 'NOTIFICATION_READALL':
            return {
                ...state,
                notifications:state.notifications.map(nt=>({...nt,isRead:true}))
            }
        case 'REMOVE_NOTIFICATION':
                return {
                    ...state,
                    notifications:state.notifications.filter(nt=>nt._id!==action.payload)
                }

        case 'CLEAR_NOTIFICATIONS':
            return {
                ...state,
                notifications: []
            };

        default:
            return state;
    }
};

export default socketReducer;
