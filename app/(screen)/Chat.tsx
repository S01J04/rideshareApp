import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getUserChats,
  getChatMessages,
  sendChatMessage,
  manualAddMessage,
  updateSentMessage,
  updateMessageOwnership,
  markChatAsRead,
} from '@/redux/slices/messageSlice';
import axiosInstance from '@/redux/axiosInstance';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);
  const [isopen, setisopen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [updateCounter, setUpdateCounter] = useState(0);
  const [keyboardOffset] = useState(new Animated.Value(0));

  const scrollRef = useRef();
  const { chats, activeMessages, loading } = useSelector((state) => state?.message);
  const { user } = useSelector((state) => state?.user);
  const dispatch = useDispatch();

  const forceUpdate = useCallback(() => {
    setUpdateCounter((prev) => prev + 1);
  }, []);

  useEffect(() => {
    dispatch(getUserChats());
  }, [dispatch]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      Animated.timing(keyboardOffset, {
        toValue: event.endCoordinates.height,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (activeMessages?.length > 0 && user?._id) {
      const updatedMessages = activeMessages.map((msg) => {
        const isFromCurrentUser = msg.senderId === user._id;
        if (msg.isOwn !== isFromCurrentUser) {
          return { ...msg, isOwn: isFromCurrentUser };
        }
        return msg;
      });

      const needsUpdate = updatedMessages.some((msg, i) => msg.isOwn !== activeMessages[i].isOwn);

      if (needsUpdate) {
        updatedMessages.forEach((msg) => {
          if (msg.isOwn !== activeMessages.find((m) => m._id === msg._id)?.isOwn) {
            dispatch(updateMessageOwnership(msg));
          }
        });
      }
    }
  }, [activeMessages, user, dispatch]);

  const openConversation = (chat) => {
    setisopen(true);
    if (!chat?.chatRoomId) return;

    dispatch(markChatAsRead(chat.chatRoomId));

    const pendingMessages = activeMessages?.filter(
      (msg) => msg.isSending && msg.chatRoomId === activeChat?.chatRoomId
    );

    setActiveChat(chat);
    dispatch(getChatMessages(chat.chatRoomId)).then(() => {
      const chatPendingMessages = pendingMessages?.filter(
        (msg) => msg.chatRoomId === chat.chatRoomId
      );
      if (chatPendingMessages?.length > 0) {
        chatPendingMessages.forEach((msg) => {
          dispatch(manualAddMessage(msg));
        });
      }
      forceUpdate();
    });
  };

  const sendMessage = () => {
    if (newMessage.trim() === '' || !activeChat?.chatRoomId) return;
    const messageText = newMessage.trim();
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content: messageText,
      senderId: user._id,
      timestamp: new Date().toISOString(),
      chatRoomId: activeChat.chatRoomId,
      isOwn: true,
      isSending: true,
    };

    dispatch(manualAddMessage(tempMessage));

    axiosInstance
      .post(`/chats/${activeChat.chatRoomId}/messages`, {
        content: messageText,
      })
      .then((response) => {
        const messageData = response.data?.message;
        dispatch(updateSentMessage({ tempId, messageData, success: true }));
      })
      .catch(() => {
        dispatch(updateSentMessage({ tempId, success: false }));
        setTimeout(() => {
          alert('There was a problem sending your message.');
        }, 100);
      });
  };

  if (loading) {
    return (
      <View className="h-full justify-center items-center">
        <View className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin" />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, marginBottom: keyboardOffset }}>
      <View className="flex-1 bg-white dark:bg-black">
        {isopen && activeChat ? (
          <View className="flex-row items-center p-4 bg-primary">
            <TouchableOpacity onPress={() => setisopen(false)} className="mr-4">
              <FontAwesome name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              {activeChat?.receiver?.fullName}
            </Text>
          </View>
        ) : (
          <View className="bg-primary p-4">
            <Text className="text-white text-lg font-semibold">Chats</Text>
          </View>
        )}

        {!isopen ? (
          <ScrollView className="flex-1">
            {chats?.length === 0 ? (
              <Text className="text-center text-gray-500 p-4">
                No conversations yet
              </Text>
            ) : (
              chats.map((chat) => (
                <TouchableOpacity
                  key={chat?.chatRoomId}
                  onPress={() => openConversation(chat)}
                  className="flex-row items-center p-4 border-b border-gray-200"
                >
                  <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden">
                    {chat?.receiver?.profilePicture && (
                      <Image
                        source={{ uri: chat.receiver.profilePicture }}
                        className="w-full h-full"
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-black dark:text-white">
                      {chat?.receiver?.fullName}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {chat?.lastMessage?.isOwn ? 'You: ' : ''}
                      {chat?.lastMessage?.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-3 pt-2"
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {activeMessages?.length === 0 ? (
                <Text className="text-center text-gray-500">No messages yet</Text>
              ) : (
                activeMessages.map((message, index) => {
                  const isFromCurrentUser =
                    message.isOwn || message.senderId === user?._id;
                  const key = message._id || `msg-${index}`;

                  return (
                    <View
                      key={key}
                      className={`mb-3 ${
                        isFromCurrentUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <View
                        className={`p-3 rounded-xl max-w-[80%] ${
                          isFromCurrentUser
                            ? 'bg-primary rounded-tr-none'
                            : 'bg-gray-300 rounded-tl-none'
                        }`}
                      >
                        <Text
                          className={`${
                            isFromCurrentUser ? 'text-white' : 'text-black'
                          }`}
                        >
                          {message?.content}
                        </Text>
                        <Text className="text-xs opacity-60 mt-1 text-right">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {message?.isSending && (
                          <Text className="text-xs text-white">Sending...</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Input Area */}
            <View className="border-t  border-gray-200 p-3 bg-white dark:bg-black">
              <View className="flex-row pb-14 items-end">
                <TextInput
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  multiline
                  className="flex-1 bg-gray-100 p-3 rounded-l-md text-black max-h-32"
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  className="bg-primary px-4 py-3 justify-center items-center rounded-r-md"
                >
                  <FontAwesome name="send" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}
