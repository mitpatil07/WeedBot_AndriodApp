import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeOut,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import ArmControls from '../components/ArmControls';
import SweetAlert from '../components/SweetAlert';
import {
    getBaseUrl,
    sendMoveCommand,
    sendArmCommand,
    toggleAutoMode,
    checkConnection,
    getHeartbeat,
} from '../services/api';

const { width, height } = Dimensions.get('window');

/* ─────────────────────────────────────────────────────────
   VERTICAL D-PAD  (Forward top, Back bottom, L/R sides)
───────────────────────────────────────────────────────── */
const DPad = ({ onCommand }) => {
    const BTN = 58;
    const GAP = 4;

    const Btn = ({ icon, dir, style }) => {
        const scale = useSharedValue(1);
        const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

        const press = () => {
            scale.value = withTiming(0.88, { duration: 80 });
            onCommand(dir);
        };
        const release = () => {
            scale.value = withTiming(1, { duration: 120 });
            onCommand('stop');
        };

        return (
            <Pressable onPressIn={press} onPressOut={release} style={style}>
                <Animated.View style={[animStyle, {
                    width: BTN, height: BTN, borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
                    justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                    elevation: 3,
                }]}>
                    <MaterialCommunityIcons name={icon} size={26} color="#1a1a1a" />
                </Animated.View>
            </Pressable>
        );
    };

    return (
        <View style={{ alignItems: 'center', gap: GAP }}>
            {/* UP */}
            <Btn icon="arrow-up-bold" dir="forward" />
            {/* MIDDLE ROW */}
            <View style={{ flexDirection: 'row', gap: GAP }}>
                <Btn icon="arrow-left-bold" dir="left" />
                {/* CENTER STOP */}
                <Pressable onPress={() => onCommand('stop')}>
                    <View style={{
                        width: BTN, height: BTN, borderRadius: 16,
                        backgroundColor: 'rgba(255,23,68,0.15)',
                        borderWidth: 1, borderColor: 'rgba(255,23,68,0.35)',
                        justifyContent: 'center', alignItems: 'center',
                    }}>
                        <MaterialCommunityIcons name="stop-circle" size={22} color="#ff1744" />
                    </View>
                </Pressable>
                <Btn icon="arrow-right-bold" dir="right" />
            </View>
            {/* DOWN */}
            <Btn icon="arrow-down-bold" dir="backward" />
        </View>
    );
};

/* ─────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────── */
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
    const statusMessages = [
        'ANALYZING TERRAIN',
        'DETECTING WEEDS',
        'OPTIMIZING PATH',
        'TARGET LOCKED',
        'SENSORS ACTIVE',
        'AI CORE: ONLINE',
    ];

    useEffect(() => {
        let i = 0;
        const msgInt = setInterval(() => {
            setAiStatus(statusMessages[i]);
            i = (i + 1) % statusMessages.length;
        }, 4000);
        const timeInt = setInterval(() => setMissionTime(p => p + 1), 1000);
        scanLineY.value = withRepeat(
            withSequence(withTiming(height, { duration: 3500 }), withTiming(0, { duration: 0 })),
            -1, false
        );
        return () => { clearInterval(msgInt); clearInterval(timeInt); };
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web') return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => { });
        return () => ScreenOrientation.unlockAsync().catch(() => { });
    }, []);

    useEffect(() => {
        const run = async () => {
            const t = Date.now();
            try {
                const ok = await checkConnection();
                setIsConnected(ok);
                if (ok) { await getHeartbeat(); setLatency(Date.now() - t); }
            } catch { setIsConnected(false); }
        };
        const iv = setInterval(run, 3000);
        run();
        return () => clearInterval(iv);
    }, []);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleMove = async dir => {
        if (!isConnected && dir !== 'stop') {
            setAlertConfig({ visible: true, title: 'Offline', message: 'Connect to robot first!', type: 'error' });
            return;
        }
        try {
            await sendMoveCommand(dir, robotSpeed);
            if (dir !== 'stop') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) { console.error(e); }
    };

    const handleArm = async cmd => {
        try { await sendArmCommand(cmd); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
        catch (e) { console.error(e); }
    };

    const handleAuto = async val => {
        try { await toggleAutoMode(val); setIsAutoMode(val); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
        catch (e) { console.error(e); }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ── FULLSCREEN VIDEO ── */}
            {isCameraEnabled && isConnected ? (
                <View style={StyleSheet.absoluteFill}>
                    <WebView
                        source={{ uri: `${getBaseUrl()}/video_feed` }}
                        style={{ flex: 1 }}
                        scrollEnabled={false}
                    />
                    {/* Scan line effect */}
                    <Animated.View pointerEvents="none" style={[s.scanLine, scanLineStyle]} />
                    {/* light vignette for readability */}
                    <View pointerEvents="none" style={s.vignette} />
                </View>
            ) : (
                <View style={[StyleSheet.absoluteFill, s.offlineBg]}>
                    <MaterialCommunityIcons name={isConnected ? 'video-off' : 'wifi-off'} size={64} color="#ddd" />
                    <Text style={s.offlineBigLabel}>{isConnected ? 'CAMERA OFF' : 'NO SIGNAL'}</Text>
                    <Text style={s.offlineSmLabel}>{getBaseUrl()}</Text>
                </View>
            )}

            {/* ── SAFE AREA OVERLAY ── */}
            <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">

                {/* ══════════  TOP HUD BAR  ══════════ */}
                <Animated.View entering={FadeInDown.duration(400)} style={s.topBar}>
                    <BlurView intensity={30} tint="light" style={s.topBarBlur}>
                        {/* Back */}
                        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconCircle}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#1a1a1a" />
                        </TouchableOpacity>

                        {/* Centre cluster */}
                        <View style={s.topCentre}>
                            <View style={[s.dot, { backgroundColor: isConnected ? '#00e676' : '#ff1744' }]} />
                            <Text style={s.topTitle}>ROVER HUD</Text>
                            <Text style={s.topSub}>{isConnected ? `${latency} ms` : 'OFFLINE'}</Text>
                        </View>

                        {/* Settings */}
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={s.iconCircle}>
                            <MaterialCommunityIcons name="cog-outline" size={20} color="#1a1a1a" />
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>

                {/* ══════════  AI STATUS STRIP  ══════════ */}
                <Animated.View entering={FadeIn.delay(300)} style={s.aiStrip} pointerEvents="none">
                    <View style={s.aiStripInner}>
                        <MaterialCommunityIcons name="brain" size={11} color="#2979ff" />
                        <Text style={s.aiTxt}>{aiStatus}</Text>
                        <View style={s.aiDivider} />
                        <MaterialCommunityIcons name="timer-outline" size={11} color="#666" />
                        <Text style={s.timeTxt}>{fmt(missionTime)}</Text>
                    </View>
                </Animated.View>

                {/* ══════════  BOTTOM CONTROLS  ══════════ */}
                <Animated.View entering={FadeInUp.delay(200)} style={s.bottomOverlay} pointerEvents="box-none">

                    {/* LEFT → D-PAD */}
                    <BlurView intensity={60} tint="light" style={s.dpadPanel}>
                        <Text style={s.panelLabel}>DRIVE</Text>
                        <DPad onCommand={handleMove} />
                    </BlurView>

                    {/* RIGHT → ACTIONS */}
                    <BlurView intensity={60} tint="light" style={s.actionPanel}>
                        <Text style={s.panelLabel}>ACTION</Text>
                        <ArmControls onCommand={handleArm} theme="light" />

                        {/* Speed mini-slider row */}
                        <View style={s.speedRow}>
                            <MaterialCommunityIcons name="speedometer" size={13} color="#666" />
                            <View style={s.speedTrack}>
                                <View style={[s.speedFill, { width: `${robotSpeed}%` }]} />
                            </View>
                            <Text style={s.speedTxt}>{robotSpeed}%</Text>
                        </View>

                        {/* Speed buttons */}
                        <View style={s.speedBtns}>
                            {[40, 60, 80, 100].map(sp => (
                                <Pressable key={sp} onPress={() => setRobotSpeed(sp)} style={[
                                    s.speedBtn,
                                    robotSpeed === sp && s.speedBtnActive,
                                ]}>
                                    <Text style={[s.speedBtnTxt, robotSpeed === sp && { color: '#2979ff' }]}>{sp}</Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Auto-pilot */}
                        <View style={s.autoRow}>
                            <MaterialCommunityIcons name="robot-outline" size={14} color={isAutoMode ? '#2979ff' : '#aaa'} />
                            <Text style={[s.autoTxt, isAutoMode && { color: '#2979ff' }]}>AUTO</Text>
                            <Switch
                                value={isAutoMode}
                                onValueChange={handleAuto}
                                trackColor={{ false: '#eee', true: '#2979ff' }}
                                thumbColor={isAutoMode ? '#fff' : '#f4f3f4'}
                                style={{ transform: [{ scale: 0.75 }], marginLeft: 4 }}
                            />
                        </View>
                    </BlurView>
                </Animated.View>

                {/* ══════════  CAM TOGGLE  ══════════ */}
                <Animated.View entering={FadeIn.delay(500)} style={s.camBtn} pointerEvents="box-none">
                    <TouchableOpacity onPress={() => setIsCameraEnabled(v => !v)} style={s.camCircle}>
                        <MaterialCommunityIcons
                            name={isCameraEnabled ? 'video' : 'video-off'}
                            size={18}
                            color={isCameraEnabled ? '#2979ff' : '#aaa'}
                        />
                    </TouchableOpacity>
                </Animated.View>

            </SafeAreaView>

            {/* ══════════  SIGNAL LOST OVERLAY  ══════════ */}
            {!isConnected && (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={s.signalLost} pointerEvents="none">
                    <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                    <Animated.View entering={FadeInDown} style={s.signalBox}>
                        <MaterialCommunityIcons name="wifi-off" size={40} color="#ff1744" />
                        <Text style={s.signalTitle}>SIGNAL LOST</Text>
                        <Text style={s.signalSub}>{getBaseUrl()}</Text>
                    </Animated.View>
                </Animated.View>
            )}

            <SweetAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig(p => ({ ...p, visible: false }))}
            />
        </View>
    );
};

/* ─────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },

    // ── VIDEO ──
    scanLine: {
        position: 'absolute', left: 0, right: 0,
        height: 1, backgroundColor: 'rgba(41,121,255,0.4)',
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.05) 100%)',
    },
    offlineBg: {
        backgroundColor: '#f8f9fa',
        justifyContent: 'center', alignItems: 'center',
    },
    offlineBigLabel: { color: '#bbb', fontSize: 13, fontWeight: '900', letterSpacing: 2, marginTop: 14 },
    offlineSmLabel: { color: '#ccc', fontSize: 9, marginTop: 4, fontWeight: 'bold', letterSpacing: 1 },

    // ── TOP BAR ──
    topBar: { marginHorizontal: 14, marginTop: 8, borderRadius: 20, overflow: 'hidden', boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
    topBarBlur: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    iconCircle: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
    },
    topCentre: { alignItems: 'center', flexDirection: 'row', gap: 8 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    topTitle: { color: '#1a1a1a', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    topSub: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

    // ── AI STRIP ──
    aiStrip: {
        alignSelf: 'center',
        marginTop: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    aiStripInner: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 5,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1, borderColor: 'rgba(41,121,255,0.1)',
        borderRadius: 20,
    },
    aiTxt: { color: '#2979ff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
    aiDivider: { width: 1, height: 10, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 4 },
    timeTxt: { color: '#888', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },

    // ── BOTTOM CONTROLS ──
    bottomOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 12,
        right: 12,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-end',
    },
    panelLabel: {
        color: '#aaa',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 10,
    },

    // D-PAD PANEL
    dpadPanel: {
        flex: 0,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        boxShadow: '0px 8px 20px rgba(0,0,0,0.05)',
        alignItems: 'center',
    },

    // ACTION PANEL
    actionPanel: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        boxShadow: '0px 8px 20px rgba(0,0,0,0.05)',
    },

    // Speed
    speedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    speedTrack: {
        flex: 1, height: 3, backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2, overflow: 'hidden',
    },
    speedFill: { height: 3, backgroundColor: '#2979ff', borderRadius: 2 },
    speedTxt: { color: '#666', fontSize: 9, fontWeight: 'bold', width: 28 },

    speedBtns: { flexDirection: 'row', gap: 6, marginTop: 8 },
    speedBtn: {
        flex: 1, paddingVertical: 5, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.02)',
    },
    speedBtnActive: {
        backgroundColor: 'rgba(41,121,255,0.05)',
        borderColor: 'rgba(41,121,255,0.2)',
    },
    speedBtnTxt: { color: '#888', fontSize: 9, fontWeight: '900' },

    // Auto
    autoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)',
    },
    autoTxt: { color: '#aaa', fontSize: 10, fontWeight: '900', letterSpacing: 1, flex: 1 },

    // Cam button
    camBtn: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        right: 16,
    },
    camCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center', alignItems: 'center',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    },

    // Signal lost
    signalLost: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    signalBox: {
        alignItems: 'center', padding: 28,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,23,68,0.1)',
        boxShadow: '0px 15px 35px rgba(255,23,68,0.1)',
    },
    signalTitle: { color: '#ff1744', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginTop: 10 },
    signalSub: { color: '#888', fontSize: 9, marginTop: 4, fontWeight: 'bold', letterSpacing: 1 },
});

export default MainScreen;