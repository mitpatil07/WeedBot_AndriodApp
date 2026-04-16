import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const ArmControls = ({ onCommand, theme }) => {
    const isLight = theme === 'light';
    const primaryColor = isLight ? '#2979ff' : '#ff00ff';
    const bgColor = isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)';

    return (
        <View style={styles.container}>
            <View style={styles.buttonRow}>
                <AnimatedButton
                    onPress={() => onCommand('left')}
                    style={[styles.smallButton, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="arrow-left-bold-outline" size={24} color={primaryColor} />
                </AnimatedButton>

                <AnimatedButton
                    onPress={() => onCommand('center')}
                    style={[styles.smallButton, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="target" size={24} color={primaryColor} />
                </AnimatedButton>

                <AnimatedButton
                    onPress={() => onCommand('right')}
                    style={[styles.smallButton, { borderColor: primaryColor, backgroundColor: bgColor }]}
                >
                    <MaterialCommunityIcons name="arrow-right-bold-outline" size={24} color={primaryColor} />
                </AnimatedButton>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    smallButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
    }
});

export default ArmControls;
