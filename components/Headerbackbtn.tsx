import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderBackBtnProps {
  onPress?: () => void;
}

export default function HeaderBackBtn({ onPress }: HeaderBackBtnProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="p-2">
        <FontAwesome name="arrow-left" size={24} color="#000" />
      </View>
    </TouchableOpacity>
  );
}