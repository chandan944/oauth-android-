// utils/storage.js - CLEAN VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CRITICAL: These keys MUST match everywhere
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

// 💾 Save token
export const saveToken = async (token) => {
  try {
    if (!token) {
      return false;
    }

    // Save to AsyncStorage
    await AsyncStorage.setItem(TOKEN_KEY, token);

    // Verify immediately by reading it back
    const verification = await AsyncStorage.getItem(TOKEN_KEY);

    if (verification === token) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// 🔑 Get token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      return token;
    } else {
      // Debug: Check if anything is stored at all
      await AsyncStorage.getAllKeys();
      return null;
    }
  } catch (error) {
    return null;
  }
};

// 👤 Save user data
export const saveUser = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    return false;
  }
};

// 👤 Get user data
export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// 🗑️ Clear all storage
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

    // Verify
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);

    if (!token && !user) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// 🔍 Debug function - check storage state
export const debugStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    for (const key of allKeys) {
      await AsyncStorage.getItem(key);
    }
  } catch (error) {}
};
