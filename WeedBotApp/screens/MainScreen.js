import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeInUp,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import ControlButtons from '../components/ControlButtons';
import ArmControls from '../components/ArmControls';
import SweetAlert from '../components/SweetAlert';
import {
    getBaseUrl,
    sendMoveCommand,
    sendArmCommand,
    toggleAutoMode,
    checkConnection,
    getHeartbeat
} from '../services/api';

const { width, height } = Dimensions.get('window');

const MainScreen = ({ navigation }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [latency, setLatency] = useState(0);
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [robotSpeed, setRobotSpeed] = useState(80);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

    const [missionTime, setMissionTime] = useState(0);
    const [aiStatus, setAiStatus] = useState('SYSTEM READY');
    const scanLineY = useSharedValue(0);

    // AI Status Randomizer
    const statusMessages = [
        'ANALYZING TERRAIN...',
        'DETECTING WEEDS...',
        'OPTIMIZING PATH...',
        'TARGETING LOCKED',
        'SENSORS CALIBRATING',
        'AI CORE: ACTIVE'
    ];

    useEffect(() => {
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            setAiStatus(statusMessages[msgIndex]);
            msgIndex = (msgIndex + 1) % statusMessages.length;
        }, 4000);

        const timeInterval = setInterval(() => {
            setMissionTime(prev => prev + 1);
        }, 1000);

        // Continuous Scanning Animation
        scanLineY.value = withRepeat(
            withSequence(
                withTiming(height * 0.4, { duration: 3000 }),
                withTiming(0, { duration: 3000 })
            ),
            -1,
            true
        );

        return () => {
            clearInterval(msgInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    // Orientation Management
    useEffect(() => {
        let isMounted = true;
        const lock = async () => {
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            } catch (e) {
                console.warn('Orientation lock blocked:', e);
            }
        };
        lock();
        const subscription = ScreenOrientation.addOrientationChangeListener(() => {
            if (isMounted) lock();
        });
        return () => {
            isMounted = false;
            subscription.remove();
            ScreenOrientation.unlockAsync().catch(() => { });
        };
    }, []);

    // Connectivity
    useEffect(() => {
        const runCheck = async () => {
            const startTime = Date.now();
            try {
                const status = await checkConnection();
                setIsConnected(status);
                if (status) {
                    await getHeartbeat();
                    setLatency(Date.now() - startTime);
                }
            } catch (e) {
                setIsConnected(false);
            }
        };
        const interval = setInterval(runCheck, 3000);
        runCheck();
        return () => clearInterval(interval);
    }, []);

    const handleMoveCommand = async (direction) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await sendMoveCommand(direction, robotSpeed);
        } catch (e) {
            console.log('Move error:', e);
        }
    };

    const handleArmCommand = async (direction) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await sendArmCommand(direction);
        } catch (e) {
            console.log('Arm error:', e);
        }
    };

    const handleToggleAuto = async (value) => {
        setIsAutoMode(value);
        try {
            await toggleAutoMode(value);
        } catch (e) {
            setIsAutoMode(!value);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* BACKGROUND: VIDEO FEED */}
            <View style={styles.videoContainer}>
                {isCameraEnabled && isConnected ? (
                    <View style={StyleSheet.absoluteFill}>
                        <WebView
                            source={{ uri: `${getBaseUrl()}/video_feed` }}
                            style={styles.webView}
                            scrollEnabled={false}
                        />
                        {/* AI SCANNING LINE */}
                        <Animated.View style={[styles.scanLine, scanLineStyle]}>
                            <View style={styles.scanLineGlow} />
                        </Animated.View>
                    </View>
                ) : (
                    <View style={styles.placeholder}>
                        <MaterialCommunityIcons name="video-off" size={60} color="#ddd" />
                        <Text style={styles.placeholderText}>FEED DISCONNECTED</Text>
                    </View>
                )}
            </View>

            {/* HUD OVERLAY */}
            <SafeAreaView style={styles.hudOverlay}>

                {/* TOP BAR */}
                <View style={styles.topHud}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#1a1a1a" />
                    </TouchableOpacity>

                    <BlurView intensity={20} tint="light" style={styles.statusPill}>
                        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#00e676' : '#ff1744' }]} />
                        <Text style={styles.statusLabel}>{isConnected ? `LIVE | ${latency}ms` : 'OFFLINE'}</Text>
                    </BlurView>

                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="tune" size={24} color="#1a1a1a" />
                    </TouchableOpacity>
                </View>

                {/* AI INTELLIGENCE OVERLAY */}
                <View style={styles.aiOverlay}>
                    <BlurView intensity={30} tint="light" style={styles.aiPanel}>
                        <View style={styles.aiRow}>
                            <MaterialCommunityIcons name="brain" size={16} color="#2979ff" />
                            <Text style={styles.aiStatusText}>{aiStatus}</Text>
                        </View>
                        <View style={styles.aiRow}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                            <Text style={styles.telemetryText}>RUNTIME: {formatTime(missionTime)}</Text>
                        </View>
                        <View style={styles.aiRow}>
                            <MaterialCommunityIcons name="target" size={14} color="#666" />
                            <Text style={styles.telemetryText}>TARGETS: {isAutoMode ? 'SCANNING' : 'STANDBY'}</Text>
                        </View>
                    </BlurView>
                </View>

                {/* BOTTOM CONTROL DECK (VERTICAL STACK) */}
                <View style={styles.deckContainer}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollDeck}>

                        {/* NAVIGATION */}
                        <Animated.View entering={FadeInUp.delay(200)} style={styles.deckPanel}>
                            <BlurView intensity={50} tint="light" style={styles.blurPanel}>
                                <Text style={styles.panelTitle}>NAVIGATION SYSTEM</Text>
                                <ControlButtons onCommand={handleMoveCommand} theme="light" />
                                <View style={styles.speedRow}>
                                    <MaterialCommunityIcons name="speedometer" size={16} color="#2979ff" />
                                    <Text style={styles.speedText}>THROTTLE: {robotSpeed}%</Text>
                                </View>
                            </BlurView>
                        </Animated.View>

                        {/* ARM & AUTO */}
                        <Animated.View entering={FadeInDown.delay(400)} style={styles.deckPanel}>
                            <BlurView intensity={50} tint="light" style={styles.blurPanel}>
                                <Text style={styles.panelTitle}>ROBOTIC ARM CONTROLS</Text>
                                <ArmControls onCommand={handleArmCommand} theme="light" />

                                <View style={styles.autoAction}>
                                    <View>
                                        <Text style={styles.autoTitle}>AUTO-PILOT MODE</Text>
                                        <Text style={styles.autoDesc}>AI Weed Detection & Removal</Text>
                                    </View>
                                    <Switch
                                        value={isAutoMode}
                                        onValueChange={handleToggleAuto}
                                        trackColor={{ false: '#eee', true: '#2979ff' }}
                                        thumbColor="#fff"
                                    />
                                </View>
                            </BlurView>
                        </Animated.View>

                    </ScrollView>
                </View>

            </SafeAreaView>

            <SweetAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    videoContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f8f9fa',
        zIndex: -1,
    },
    webView: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '900',
        marginTop: 10,
        letterSpacing: 2,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(41, 121, 255, 0.5)',
        zIndex: 5,
    },
    scanLineGlow: {
        height: 40,
        backgroundColor: 'rgba(41, 121, 255, 0.05)',
        marginTop: -20,
    },
    hudOverlay: {
        flex: 1,
    },
    aiOverlay: {
        position: 'absolute',
        top: 100,
        left: 20,
    },
    aiPanel: {
        borderRadius: 15,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderLeftWidth: 3,
        borderLeftColor: '#2979ff',
        overflow: 'hidden',
    },
    aiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    aiStatusText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#2979ff',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    telemetryText: {
        fontSize: 10,
        color: '#444',
        marginLeft: 6,
        fontWeight: '600',
    },
    topHud: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 10,
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
        elevation: 3,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 1,
    },
    deckContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    scrollDeck: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 40,
    },
    deckPanel: {
        marginBottom: 15,
    },
    blurPanel: {
        borderRadius: 28,
        overflow: 'hidden',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        boxShadow: '0px 10px 25px rgba(0,0,0,0.05)',
        elevation: 4,
    },
    panelTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        letterSpacing: 1,
    },
    speedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    speedText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#2979ff',
        marginLeft: 6,
    },
    autoAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    autoTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#1a1a1a',
    },
    autoDesc: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    }
});

export default MainScreen;
