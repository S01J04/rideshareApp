import { ActivityIndicator, Text, Pressable, Animated } from 'react-native'
import React, { useRef } from 'react'

interface ButtonProps {
  CN: {
    bgcolor: string;
    color: string;
  };
  text: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({ CN, text, onPress, loading = false, disabled = false }: ButtonProps) => {
  const animated = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(animated, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(animated, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Determine if the button should be disabled
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={isDisabled ? undefined : onPressIn}
      onPressOut={isDisabled ? undefined : onPressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          { transform: [{ scale: animated }] },
          isDisabled ? { opacity: 0.7 } : {}
        ]}
        className={`w-full text-center px-5 rounded-full py-3 ${CN.bgcolor} my-2 flex-row justify-center items-center`}
      >
        {loading ? (
          <ActivityIndicator color={CN.color.includes('text-white') ? 'white' : '#2DBEFF'} />
        ) : (
          <Text className={`text-center text-lg font-semibold ${CN.color}`}>{text}</Text>
        )}
      </Animated.View>
    </Pressable>
  )
}

export default Button
