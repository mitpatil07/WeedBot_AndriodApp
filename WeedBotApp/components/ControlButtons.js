import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const ControlButtons = ({ onCommand, theme }) => {
    const isLight = theme === 'light';
    const primaryColor = isLight ? '#2979ff' : '#00ffff';
    const bgColor = isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)';
    const shadowColor = isLight ? 'rgba(0,0,0,0.1)' : primaryColor;

    return (
        <View style={styles.grid}>
            <View style={styles.row}>
                <AnimatedButton
                    onPress={() => onCommand('forward')}
                    style={[styles.button, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="chevron-up" size={32} color={primaryColor} />
                </AnimatedButton>
            </View>

            <View style={styles.row}>
                <AnimatedButton
                    onPress={() => onCommand('left')}
                    style={[styles.button, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="chevron-left" size={32} color={primaryColor} />
                </AnimatedButton>

                <AnimatedButton
                    onPress={() => onCommand('stop')}
                    style={[styles.stopButton, { borderColor: '#ff1744' }]}
                >
                    <MaterialCommunityIcons name="stop-circle" size={36} color="#ff1744" />
                </AnimatedButton>

                <AnimatedButton
                    onPress={() => onCommand('right')}
                    style={[styles.button, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="chevron-right" size={32} color={primaryColor} />
                </AnimatedButton>
            </View>

            <View style={styles.row}>
                <AnimatedButton
                    onPress={() => onCommand('backward')}
                    style={[styles.button, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="chevron-down" size={32} color={primaryColor} />
                </AnimatedButton>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
    },
    button: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 3,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    },
    stopButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        elevation: 5,
        boxShadow: '0px 4px 8px rgba(255,23,68,0.2)',
    }
});

export default ControlButtons;
