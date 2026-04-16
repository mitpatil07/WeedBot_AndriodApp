import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Switch,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBaseUrl, setBaseUrl } from '../services/api';
import AnimatedButton from '../components/AnimatedButton';
import SweetAlert from '../components/SweetAlert';

const SettingsScreen = ({ navigation }) => {
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        // Parse current base URL
        const url = getBaseUrl().replace('http://', '').split(':');
        setIp(url[0]);
        setPort(url[1] || '5000');
    }, []);

    const handleSave = () => {
        setBaseUrl(`http://${ip}:${port}`);
        setShowAlert(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Network Configuration</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="ip-network" size={20} color="#2979ff" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>IP Address</Text>
                                <TextInput
                                    style={styles.input}
                                    value={ip}
                                    onChangeText={setIp}
                                    placeholder="192.168.1.100"
                                    placeholderTextColor="#bbb"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { marginTop: 25 }]}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="api" size={20} color="#2979ff" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Port</Text>
                                <TextInput
                                    style={styles.input}
                                    value={port}
                                    onChangeText={setPort}
                                    placeholder="5000"
                                    placeholderTextColor="#bbb"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                                <Text style={styles.settingDesc}>Tactile vibration pulses</Text>
                            </View>
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={setHapticsEnabled}
                                trackColor={{ false: '#eee', true: '#2979ff' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>APPLY CHANGES</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>WeedBot Control v2.5.0 Premium</Text>
                </View>

                <SweetAlert
                    visible={showAlert}
                    title="Settings Saved"
                    message="Configuration parameters updated."
                    type="success"
                    onClose={() => setShowAlert(false)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 35,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 15,
        letterSpacing: 2,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        boxShadow: '0px 10px 20px rgba(0,0,0,0.03)',
        elevation: 3,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        marginLeft: 18,
    },
    label: {
        color: '#888',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 4,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: 'bold',
    },
    settingDesc: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    footer: {
        marginTop: 20,
        paddingBottom: 40,
    },
    saveButton: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 18,
        borderRadius: 36,
        alignItems: 'center',
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 2,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 25,
        color: '#ccc',
        fontSize: 11,
        fontWeight: 'bold',
    }
});

export default SettingsScreen;
