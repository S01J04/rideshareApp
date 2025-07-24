import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

// Async Thunks
export const getUserChats = createAsyncThunk(
  'messages/getUserChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/chats');
      console.log("User chats response:", response);
      // Handle both response formats (with or without .data wrapper)
      return response.data || [];
    } catch (error) {
      console.error("Error fetching chats:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const getChatMessages = createAsyncThunk(
  'messages/getChatMessages',
  async (chatRoomId, { rejectWithValue, getState }) => {
    try {
      console.log(`Fetching messages for chat room ${chatRoomId}`);
      const response = await axiosInstance.get(`/chats/${chatRoomId}`);
      console.log("Chat messages response:", response);
      
      // Extract user ID from state to determine message ownership
      const state = getState();
      const currentUserId = state?.user?.user?._id || state?.message?.currentUserId;
      // Process messages to add isOwn property
      let messages = response.data?.messages || [];
      
      if (Array.isArray(messages)) {
        messages = messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === currentUserId,
          // Only server messages have this guaranteed
          fromServer: true
        }));
      }
      
      console.log(`Processed ${messages.length} messages with currentUserId:`, currentUserId);
      return { data: messages, chatRoomId };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'messages/sendChatMessage',
  async ({ chatRoomId, content }, { dispatch, rejectWithValue }) => {
    try {
      if (!chatRoomId || !content) {
        return rejectWithValue('Chat ID and message content are required');
      }
      
      console.log(`Sending message to chat ${chatRoomId}: "${content}"`);
      const response = await axiosInstance.post(`/chats/${chatRoomId}/messages`, { content });
      console.log("Send message response:", response.data);
      
      // Handle different response formats to ensure we get the message
      let message;
      if (response.data?.message) {
        // Standard format
        message = response.data.message;
      } else if (response.data?.message && typeof response.data.message === 'object') {
        // Alternate format
        message = response.data.message;
      } else {
        console.error("Invalid response format:", response.data);
        
        // Create a placeholder message as fallback
        message = {
          _id: `temp-${Date.now()}`,
          content,
          senderId: 'current-user', // This is a fallback
          timestamp: new Date().toISOString(),
          chatRoomId,
          isOwn: true
        };
      }
      
      // Ensure message has chatRoomId
      if (!message.chatRoomId) {
        message.chatRoomId = chatRoomId;
      }
      
      console.log("Processed message:", message);
      dispatch(addMessage(message));
      
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markChatAsRead = createAsyncThunk(
  'messages/markChatAsRead',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/chats/${chatRoomId}/read`);
      return chatRoomId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark chat as read');
    }
  }
);

const initialState = {
  chats: [],
  activeMessages: [],
  activeChatRoomId: null,
  currentUserId: null,
  loading: false,
  error: null
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage(state, action) {
      try {
        const message = action.payload;
        console.log("Adding message to Redux store:", message);
        
        if (!message) {
          console.warn("Attempted to add null/undefined message");
          return;
        }
        
        // Initialize activeMessages array if needed
        if (!state.activeMessages) {
          state.activeMessages = [];
        }
        
        // Check if message already exists to prevent duplicates
        const existsInActive = state.activeMessages.some(
          msg => msg._id === message._id
        );
        
        // Get the current active chat room ID, if any
        const activeChatRoomId = state.activeChatRoomId;
        
        // For incoming messages from others, increment unread counter
        // if the message is not in the currently active chat
        if (message.chatRoomId && 
            message.senderId !== state.currentUserId && 
            message.chatRoomId !== activeChatRoomId && 
            state.chats) {
          
          // Find the chat in the list
          const chatIndex = state.chats.findIndex(
            c => c.chatRoomId === message.chatRoomId
          );
          
          if (chatIndex !== -1) {
            // Increment unread count for this chat
            state.chats[chatIndex].unreadCount = 
              (state.chats[chatIndex].unreadCount || 0) + 1;
            
            console.log(`Incremented unread count for chat ${message.chatRoomId} to ${state.chats[chatIndex].unreadCount}`);
          }
        }
        
        // Add message to active messages if not already present and if it 
        // belongs to the active chat room, if there is one
        if (!existsInActive && 
            (!activeChatRoomId || message.chatRoomId === activeChatRoomId)) {
          state.activeMessages.push(message);
        }
        
        // Also update the chat list with the last message
        if (message.chatRoomId && state.chats) {
          const chatIndex = state.chats.findIndex(
            c => c.chatRoomId === message.chatRoomId
          );
          
          if (chatIndex !== -1) {
            // Update the last message for this chat
            state.chats[chatIndex].lastMessage = {
              content: message.content,
              timestamp: message.timestamp,
              isOwn: message.isOwn
            };
          }
        }
      } catch (err) {
        console.error("Error in addMessage reducer:", err);
      }
    },
    
    // Direct manual addition to activeMessages array
    // This is used to bypass the normal filtering and add a message directly
    manualAddMessage(state, action) {
      console.log("MANUAL_ADD_MESSAGE:", action.payload);
      if (!state.activeMessages) state.activeMessages = [];
      
      // Add directly to activeMessages without any filtering
      state.activeMessages.push(action.payload);
      
      // Also update the chat list if needed
      if (action.payload.chatRoomId && state.chats) {
        const chatIndex = state.chats.findIndex(
          c => c.chatRoomId === action.payload.chatRoomId
        );
        
        if (chatIndex >= 0) {
          state.chats[chatIndex].lastMessage = {
            content: action.payload.content,
            timestamp: action.payload.timestamp,
            isOwn: true
          };
        }

        if (chatIndex !== -1 && !action.payload.isOwn) {
          // Increment unread count for this chat
          state.chats[chatIndex].unreadCount = 
            (state.chats[chatIndex].unreadCount || 0) + 1;
          
        }
        if(chatIndex !== -1 && action.payload.isOwn){
          state.chats[chatIndex].unreadCount = 0;
        }
      }
    },
    clearMessages(state) {
      state.activeMessages = [];
    },
    // Update a sent message with server data or status
    updateSentMessage(state, action) {
      const { tempId, messageData, success } = action.payload;
      console.log("UPDATE_SENT_MESSAGE:", action.payload);
      
      if (!state.activeMessages) return;
      
      // Find the temporary message by tempId
      const messageIndex = state.activeMessages.findIndex(
        m => m._id === tempId
      );
      
      if (messageIndex !== -1) {
        if (success && messageData) {
          // Replace temp message with real message from server
          state.activeMessages[messageIndex] = {
            ...messageData,
            isSending: false,
            isOwn: true
          };
        } else {
          // Just update the sending status
          state.activeMessages[messageIndex].isSending = false;
          // Mark as error if needed
          if (!success) {
            state.activeMessages[messageIndex].sendError = true;
          }
        }
      }
    },
    // Update message ownership status
    updateMessageOwnership(state, action) {
      if (!state.activeMessages) return;
      
      const message = action.payload;
      const messageIndex = state.activeMessages.findIndex(
        m => m._id === message._id
      );
      
      if (messageIndex !== -1) {
        state.activeMessages[messageIndex].isOwn = message.isOwn;
      }
    },
    // Reset unread count for a specific chat
    resetUnreadCount(state, action) {
      const chatRoomId = action.payload;
      console.log("Resetting unread count for chat:", chatRoomId);
      
      // Update active chat room ID
      state.activeChatRoomId = chatRoomId;
      
      if (state.chats && state.chats.length > 0) {
        const chatIndex = state.chats.findIndex(
          chat => chat.chatRoomId === chatRoomId
        );
        
        if (chatIndex !== -1) {
          console.log(`Found chat at index ${chatIndex}, resetting unread count from ${state.chats[chatIndex].unreadCount} to 0`);
          state.chats[chatIndex].unreadCount = 0;
        } else {
          console.log(`Could not find chat with ID ${chatRoomId} to reset unread count`);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserChats reducers
      .addCase(getUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserChats.fulfilled, (state, action) => {
        state.loading = false;
        console.log("User chats response from getUserChats:", action.payload);
        state.chats = action.payload;
      })
      .addCase(getUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getChatMessages reducers
      .addCase(getChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Save any pending (unsent) messages before clearing
        const pendingMessages = state.activeMessages?.filter(msg => msg.isSending === true) || [];
        state.pendingMessages = pendingMessages;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Chat messages response from getChatMessages:", action.payload);
        
        // Process the new messages from the server
        const messages = action.payload?.data || [];
        const currentUserId = state.currentUserId;
        
        // Make sure the messages array has the correct structure
        state.activeMessages = messages.map(msg => ({
          ...msg,
          // If message has fromServer property, trust the isOwn value calculated in the thunk
          // Otherwise calculate it here based on currentUserId
          isOwn: msg.fromServer ? msg.isOwn : (msg.senderId === currentUserId),
          isSending: false, // Messages from server are never in sending state
        }));
        
        // Re-add any pending messages
        if (state.pendingMessages?.length > 0) {
          const currentChatId = action.payload?.chatRoomId; // The chatRoomId we requested
          const relevantPendingMessages = state.pendingMessages.filter(
            msg => msg.chatRoomId === currentChatId
          );
          
          if (relevantPendingMessages.length > 0) {
            console.log("Re-adding pending messages in reducer:", relevantPendingMessages.length);
            state.activeMessages = [
              ...state.activeMessages,
              ...relevantPendingMessages
            ];
          }
        }
        
        // Clear the temp storage of pending messages
        delete state.pendingMessages;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeMessages = []; // Reset on error
      })
      
      // sendChatMessage reducers
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Add message to active messages if it has valid data
        if (action.payload) {
          state.activeMessages.push(action.payload);
          
          // Update last message in chat list
          if (action.payload.chatRoomId) {
            const chatIndex = state.chats.findIndex(
              c => c.chatRoomId === action.payload.chatRoomId
            );
            if (chatIndex !== -1) {
              state.chats[chatIndex].lastMessage = {
                content: action.payload.content,
                timestamp: action.payload.timestamp,
                isOwn: true
              };
            }
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // markChatAsRead reducers
      .addCase(markChatAsRead.fulfilled, (state, action) => {
        console.log("Mark chat as read:", action.payload);
        const chatIndex = state.chats.findIndex(
          c => c.chatRoomId === action.payload
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = 0;
        }
        state.activeMessages.forEach(msg => {
          if (msg.chatRoomId === action.payload) {
            msg.readStatus = true;
          }
        });
      })
      
      // Store user ID when available for isOwn calculations
      .addMatcher(
        action => action.type === 'user/login/fulfilled' || action.type === 'user/getCurrentUser/fulfilled',
        (state, action) => {
          if (action.payload && action.payload.user && action.payload.user._id) {
            state.currentUserId = action.payload.user._id;
            console.log("Set currentUserId in message slice:", state.currentUserId);

            // Update isOwn flags in active messages if any
            if (state.activeMessages && state.activeMessages.length > 0) {
              state.activeMessages.forEach(msg => {
                msg.isOwn = msg.senderId === state.currentUserId;
              });
            }
          }
        }
      );
  },
});

export const { 
  addMessage, 
  clearMessages, 
  manualAddMessage, 
  updateSentMessage, 
  updateMessageOwnership,
  resetUnreadCount,
} = messageSlice.actions;

// Export the reducer
export default messageSlice.reducer;