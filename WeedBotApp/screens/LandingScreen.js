import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn, SlideInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    const features = [
        { icon: 'camera-iris', title: 'Precision Vision', desc: '1080p AI-powered weed identification system.' },
        { icon: 'robot-mower-outline', title: 'Smart Autopilot', desc: 'Autonomous navigation with obstacle avoidance.' },
        { icon: 'shield-check-outline', title: 'Safety First', desc: 'Encrypted control link & emergency auto-stop.' }
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* TOP BAR: APP LOGO & SETTINGS */}
                <SafeAreaView style={styles.topBar}>
                    <Animated.View entering={FadeIn.delay(300)} style={styles.logoRow}>
                        <View style={styles.logoCircle}>
                            <MaterialCommunityIcons name="robot" size={24} color="#2979ff" />
                        </View>
                        <Text style={styles.appName}>WEEDBOT</Text>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.settingsCircle}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <MaterialCommunityIcons name="cog" size={24} color="#666" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* HERO SECTION */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
                    <Text style={styles.heroTitle}>The Future of</Text>
                    <Text style={styles.heroTitleBold}>Smart Agriculture</Text>
                    <Text style={styles.heroSub}>Precision weeding made simple and eco-friendly.</Text>
                </Animated.View>

                {/* MAIN VISUAL */}
                <Animated.View entering={FadeIn.delay(500)} style={styles.visualContainer}>
                    <View style={styles.visualGlow} />
                    <MaterialCommunityIcons name="tractor-variant" size={140} color="#2979ff" />
                </Animated.View>

                {/* FEATURES */}
                <View style={styles.featuresList}>
                    {features.map((item, index) => (
                        <Animated.View
                            key={index}
                            entering={SlideInRight.delay(600 + index * 100)}
                            style={styles.featureItem}
                        >
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name={item.icon} size={28} color="#2979ff" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>{item.title}</Text>
                                <Text style={styles.featureDesc}>{item.desc}</Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* START BUTTON */}
                <Animated.View entering={FadeInUp.delay(1000)} style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.mainAction}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <Text style={styles.mainActionText}>START MISSION</Text>
                        <MaterialCommunityIcons name="chevron-right" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.footerText}>Version 2.5.0 • Powered by WeedBot AI</Text>
                </Animated.View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 4,
    },
    settingsCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        marginBottom: 40,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '300',
        color: '#666',
    },
    heroTitleBold: {
        fontSize: 34,
        fontWeight: '900',
        color: '#1a1a1a',
        marginTop: -4,
    },
    heroSub: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
        lineHeight: 24,
    },
    visualContainer: {
        height: 220,
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        borderWidth: 1,
        borderColor: '#eee',
        position: 'relative',
        overflow: 'hidden',
    },
    visualGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2979ff',
        opacity: 0.05,
    },
    featuresList: {
        marginBottom: 60,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.03)',
        elevation: 2,
    },
    featureText: {
        marginLeft: 20,
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    featureDesc: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    bottomBar: {
        alignItems: 'center',
    },
    mainAction: {
        backgroundColor: '#2979ff',
        width: '100%',
        height: 72,
        borderRadius: 36,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 15px 30px rgba(41, 121, 255, 0.3)',
        elevation: 8,
    },
    mainActionText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        marginRight: 10,
    },
    footerText: {
        marginTop: 20,
        fontSize: 12,
        color: '#bbb',
        fontWeight: '600',
    }
});

export default LandingScreen;
