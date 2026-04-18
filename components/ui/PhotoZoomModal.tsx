import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { X } from '@/constants/icons';

interface PhotoZoomModalProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export function PhotoZoomModal({
  visible,
  uri,
  onClose,
}: PhotoZoomModalProps) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close photo"
          accessibilityRole="button"
          style={{
            position: 'absolute',
            top: 56,
            right: 24,
            zIndex: 10,
            padding: 8,
          }}
        >
          <X size={28} color="#fff" />
        </Pressable>
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              { flex: 1, justifyContent: 'center', alignItems: 'center' },
              style,
            ]}
          >
            <Image
              source={{ uri }}
              style={{ width, height: height * 0.8, resizeMode: 'contain' }}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
