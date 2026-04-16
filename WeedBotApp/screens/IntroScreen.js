import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    withDelay
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Floating animation for the robot icon
        translateY.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 2000 }),
                withTiming(0, { duration: 2000 })
            ),
            -1,
            true
        );

        // Subtle pulsing scale
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500 }),
                withTiming(1, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ]
    }));

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.delay(200)} style={styles.animationContainer}>
                <Animated.View style={animatedIconStyle}>
                    <MaterialCommunityIcons name="robot-industrial" size={width * 0.4} color="#2979ff" />
                </Animated.View>
                <View style={styles.glow} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)} style={styles.textContainer}>
                <Text style={styles.title}>WEEDBOT AI</Text>
                <Text style={styles.subtitle}>Smart Agriculture Solutions</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Landing')}
                >
                    <Text style={styles.buttonText}>GET STARTED</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    animationContainer: {
        width: width * 0.8,
        height: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: width * 0.3,
        height: 40,
        backgroundColor: 'rgba(41, 121, 255, 0.15)',
        bottom: -20,
        borderRadius: 50,
        filter: 'blur(15px)',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 50,
    },
    button: {
        backgroundColor: '#2979ff',
        paddingVertical: 18,
        paddingHorizontal: 60,
        borderRadius: 40,
        boxShadow: '0px 10px 15px rgba(41, 121, 255, 0.2)',
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default IntroScreen;
