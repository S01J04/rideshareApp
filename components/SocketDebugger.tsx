import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSocket } from '@/redux/socket';
import { useDispatch } from 'react-redux';
import { initializeSocket, disconnectSocket } from '@/redux/actions/socketAction';

export default function SocketDebugger() {
  const { socket, isConnected, connectionStatus } = useSocket();
  const dispatch = useDispatch();

  const handleInitialize = () => {
    console.log('🔧 Manually initializing socket...');
    dispatch(initializeSocket());
  };

  const handleDisconnect = () => {
    console.log('🔌 Manually disconnecting socket...');
    dispatch(disconnectSocket());
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-orange-600';
      case 'not_initialized': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected';
      case 'disconnected': return '❌ Disconnected';
      case 'error': return '⚠️ Error';
      case 'not_initialized': return '⏳ Not Initialized';
      default: return '❓ Unknown';
    }
  };

  return (
    <View className="bg-gray-100 p-4 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-2">Socket Debugger</Text>
      
      <View className="mb-3">
        <Text className="text-sm text-gray-600">Status:</Text>
        <Text className={`text-base font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </Text>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-600">Socket ID:</Text>
        <Text className="text-base font-mono">
          {socket?.id || 'Not available'}
        </Text>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-600">Connected:</Text>
        <Text className="text-base">
          {isConnected ? 'Yes' : 'No'}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleInitialize}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">Initialize</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDisconnect}
          className="bg-red-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 