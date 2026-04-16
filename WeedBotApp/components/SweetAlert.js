import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ScaleInCenter, ScaleOutCenter } from 'react-native-reanimated';

const SweetAlert = ({ visible, title, message, type, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'check-circle', color: '#00e676' };
            case 'error': return { name: 'alert-circle', color: '#ff1744' };
            default: return { name: 'information', color: '#2979ff' };
        }
    };

    const icon = getIcon();

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />

                <Animated.View
                    entering={ScaleInCenter}
                    exiting={ScaleOutCenter}
                    style={styles.container}
                >
                    <MaterialCommunityIcons name={icon.name} size={60} color={icon.color} />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: icon.color }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    container: {
        width: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        elevation: 10,
    },
    title: {
        color: '#1a1a1a',
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
    message: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SweetAlert;
