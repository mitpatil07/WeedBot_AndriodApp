import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedButton = ({ children, onPress, style, disabled }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value) }],
    }));

    const handlePressIn = () => {
        if (disabled) return;
        scale.value = 0.92;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
        if (disabled) return;
        scale.value = 1;
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                style,
                disabled && styles.disabled
            ]}
        >
            <Animated.View style={[styles.container, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    }
});

export default AnimatedButton;
