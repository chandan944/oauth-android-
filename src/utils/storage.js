import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  USER: '@user_data',
  ONBOARDING_COMPLETE: '@onboarding_complete',
};

// Token Management
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    console.log('✅ Token saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving token:', error);
    return false;
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

// User Management
export const saveUser = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    console.log('✅ User data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

// Onboarding Management
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    console.log('✅ Onboarding marked as complete');
    return true;
  } catch (error) {
    console.error('❌ Error setting onboarding status:', error);
    return false;
  }
};

export const isOnboardingComplete = async () => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return status === 'true';
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
};

// Clear All Storage
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
    ]);
    // Note: We don't clear ONBOARDING_COMPLETE on logout
    console.log('✅ Storage cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    return false;
  }
};

// Clear Everything (including onboarding - useful for testing)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ All storage cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing all storage:', error);
    return false;
  }
};