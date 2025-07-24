import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axiosInstance from '@/redux/axiosInstance';
import {
  notificationReceived,
  notificationRead,
  clearNotifications,
  removeNotification,
  notificationReadAll
} from '@/redux/actions/socketAction';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
}

const DriverNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { notifications } = useSelector((state: any) => state.notifications);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    dispatch(notificationReadAll());
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Notifications screen focused, refreshing data...');
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching notifications from API...');

      const res = await axiosInstance.get('/notifications');
      console.log('📨 Notifications response:', res?.data);

      if (!res?.data?.notifications?.length) {
        console.log('📭 No notifications found');
        setLoading(false);
        return;
      }

      // Clear existing notifications and add new ones
      dispatch(clearNotifications());
      res.data.notifications.forEach((n: Notification) => {
        console.log('➕ Adding notification:', n._id);
        dispatch(notificationReceived(n));
      });

      // Mark all as read
      await axiosInstance.patch('/notifications/mark-all-read');
      dispatch(notificationReadAll());
      
      console.log('✅ Notifications loaded successfully');
    } catch (e) {
      console.error('❌ Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh hook
  useAutoRefresh({
    onRefresh: fetchNotifications,
    refreshOnAppStateChange: true,
    refreshOnSocketEvents: ['new_notification'],
    autoRefreshInterval: 60000 // Refresh every minute
  });

  const markAsRead = async (id: string) => {
    try {
      console.log('📖 Marking notification as read:', id);
      await axiosInstance.patch(`/notifications/${id}/read`);
      dispatch(notificationRead(id));
    } catch (e) {
      console.error('❌ Error marking notification as read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      console.log('🗑️ Deleting notification:', id);
      dispatch(removeNotification(id));
      await axiosInstance.delete(`/notifications/${id}`);
    } catch (e) {
      console.error('❌ Error deleting notification:', e);
      Alert.alert('Error deleting notification');
    }
  };

  const handleBookingApproval = async (notification: Notification, approved: boolean) => {
    try {
      let reason = '';
      if (!approved) {
        reason = prompt('Please provide a reason for rejection:') || '';
        if (!reason) return Alert.alert('Rejection reason is required');
      }

      await markAsRead(notification._id);
      const res = await axiosInstance.post(
        `/bookings/${notification.data.bookingId}/${notification._id}/${approved ? 'approve' : 'reject'}`,
        approved ? {} : { reason }
      );
      dispatch(removeNotification(notification._id));
      Alert.alert(approved ? 'Booking approved' : 'Booking rejected');

      if (approved && res?.data?.data?.chatRoomId) {
        setTimeout(() => {
          navigation.navigate('ChatScreen', { id: res.data.data.chatRoomId });
        }, 500);
      }
    } catch (err) {
      console.error('❌ Error processing booking:', err);
      Alert.alert('Error processing booking');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);

    if (
      (notification?.type === 'chat_created' || notification?.type === 'booking_approved') &&
      notification?.data?.chatRoomId
    ) {
      navigation.navigate('ChatScreen', { id: notification.data.chatRoomId });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black p-4">
      <View className="flex-row items-center mb-4">
        <FontAwesome name="bell" size={24} color="#2563eb" />
        <Text className="text-xl font-semibold ml-2">Notifications</Text>
        <TouchableOpacity 
          onPress={onRefresh}
          className="ml-auto p-2"
        >
          <FontAwesome name="refresh" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {notifications?.length === 0 ? (
        <View className="items-center justify-center mt-10">
          <FontAwesome name="bell-slash" size={50} color="#9ca3af" />
          <Text className="text-gray-500 mt-2">No notifications yet</Text>
          <Text className="text-gray-400 text-sm mt-1">Pull down to refresh</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`bg-white dark:bg-gray-900 p-4 rounded-xl mb-3 shadow ${
                !item.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
              onPress={() => handleNotificationClick(item)}
            >
              {item.type !== 'booking_request' && (
                <TouchableOpacity
                  onPress={() => deleteNotification(item._id)}
                  className="absolute top-2 right-2 z-10"
                >
                  <FontAwesome name="trash" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}

              <Text className="font-bold mb-1">{item.message}</Text>

              {item.type === 'booking_request' && (
                <Text className="text-lg font-bold text-blue-500 mb-2">
                  {format(new Date(item?.data?.departureDate), 'MMM d, yyyy')}
                </Text>
              )}

              {(item.type === 'chat_created' || item.type === 'booking_approved') &&
                item?.data?.chatRoomId && (
                  <Text className="text-xs text-blue-500 mt-1">Click to open chat</Text>
                )}

              {item.type === 'booking_request' && (
                <View className="mt-4">
                  <View className="mb-2">
                    <Text className="text-sm font-semibold">
                      {item?.data?.pickupPoint?.address} → {item?.data?.dropoffPoint?.address}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item?.data?.departureTime} - {item?.data?.arrivalTime} ({item?.data?.totalDuration})
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-blue-100 items-center justify-center">
                      {item?.data?.passenger?.profileImage ? (
                        <Image
                          source={{ uri: item?.data?.passenger?.profileImage }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <FontAwesome name="user" size={24} color="#2563eb" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold">{item?.data?.passenger?.name}</Text>
                      <Text className="text-xs text-gray-600">{item?.data?.passenger?.email}</Text>
                      <Text className="text-xs text-gray-600">{item?.data?.passenger?.phone}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="bg-red-500 px-4 py-2 rounded-lg flex-1"
                      onPress={() => handleBookingApproval(item, false)}
                    >
                      <Text className="text-white font-semibold text-center">Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-green-500 px-4 py-2 rounded-lg flex-1"
                      onPress={() => handleBookingApproval(item, true)}
                    >
                      <Text className="text-white font-semibold text-center">Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default DriverNotifications;
