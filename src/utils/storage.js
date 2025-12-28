import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  TOKEN: '@self_help_token',
  USER: '@self_help_user',
};

// Save token
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Save user data
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Get user data
export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Clear all data (logout)
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};