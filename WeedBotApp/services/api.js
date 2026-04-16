import axios from 'axios';

let BASE_URL = 'http://192.168.1.100:5000'; // Default, can be updated via UI

export const setBaseUrl = (url) => {
    BASE_URL = url;
};

export const getBaseUrl = () => BASE_URL;

const apiClient = axios.create({
    timeout: 5000,
});

export const sendMoveCommand = async (direction, speed = 80) => {
    try {
        // Matches documentation: POST /move { "direction": "...", "speed": 80 }
        const response = await apiClient.post(`${BASE_URL}/move`, {
            direction: direction,
            speed: speed
        });
        return response.data;
    } catch (error) {
        console.error('Error sending move command:', error);
        throw error;
    }
};

export const getHeartbeat = async () => {
    try {
        const response = await apiClient.get(`${BASE_URL}/heartbeat`, { timeout: 2000 });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendArmCommand = async (direction) => {
    try {
        // Backend might expect 'command' or 'direction' - keeping it as 'direction' for now
        // but mapping to /arm endpoint
        const response = await apiClient.post(`${BASE_URL}/arm`, { direction });
        return response.data;
    } catch (error) {
        console.error('Error sending arm command:', error);
        throw error;
    }
};

export const toggleAutoMode = async (isActive) => {
    try {
        // Backend expects /mode with { mode: 'auto' | 'manual' }
        const response = await apiClient.post(`${BASE_URL}/mode`, {
            mode: isActive ? 'auto' : 'manual'
        });
        return response.data;
    } catch (error) {
        console.error('Error toggling auto mode:', error);
        throw error;
    }
};

export const checkConnection = async () => {
    try {
        const response = await apiClient.get(`${BASE_URL}/status`, { timeout: 2000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};
