// utils/storage.js - DEBUG VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CRITICAL: These keys MUST match everywhere
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

// 💾 Save token with extensive debugging
export const saveToken = async (token) => {
  try {
    console.log('💾 [saveToken] Starting...');
    console.log('💾 [saveToken] Key:', TOKEN_KEY);
    console.log('💾 [saveToken] Token length:', token?.length || 0);
    
    if (!token) {
      console.error('❌ [saveToken] No token provided!');
      return false;
    }
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ [saveToken] Saved to AsyncStorage');
    
    // Verify immediately by reading it back
    const verification = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (verification === token) {
      console.log('✅ [saveToken] VERIFIED - Token successfully saved and retrieved');
      console.log('✅ [saveToken] Stored token preview:', token.substring(0, 20) + '...');
      return true;
    } else {
      console.error('❌ [saveToken] VERIFICATION FAILED!');
      console.error('❌ [saveToken] Expected:', token.substring(0, 20) + '...');
      console.error('❌ [saveToken] Got:', verification?.substring(0, 20) || 'null');
      return false;
    }
  } catch (error) {
    console.error('❌ [saveToken] Error:', error.message);
    console.error('❌ [saveToken] Stack:', error.stack);
    return false;
  }
};

// 🔑 Get token with extensive debugging
export const getToken = async () => {
  try {
    console.log('🔑 [getToken] Attempting to retrieve token...');
    console.log('🔑 [getToken] Key:', TOKEN_KEY);
    
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (token) {
      console.log('✅ [getToken] Token found!');
      console.log('✅ [getToken] Token length:', token.length);
      console.log('✅ [getToken] Token preview:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('⚠️ [getToken] No token found in storage');
      
      // Debug: Check if anything is stored at all
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 [getToken] All storage keys:', allKeys);
      
      return null;
    }
  } catch (error) {
    console.error('❌ [getToken] Error:', error.message);
    console.error('❌ [getToken] Stack:', error.stack);
    return null;
  }
};

// 👤 Save user data
export const saveUser = async (userData) => {
  try {
    console.log('👤 [saveUser] Saving user data for:', userData?.email);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log('✅ [saveUser] User data saved');
    return true;
  } catch (error) {
    console.error('❌ [saveUser] Error:', error.message);
    return false;
  }
};

// 👤 Get user data
export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) {
      const parsed = JSON.parse(userData);
      console.log('✅ [getUser] User data retrieved:', parsed?.email);
      return parsed;
    }
    console.log('⚠️ [getUser] No user data found');
    return null;
  } catch (error) {
    console.error('❌ [getUser] Error:', error.message);
    return null;
  }
};

// 🗑️ Clear all storage
export const clearStorage = async () => {
  try {
    console.log('🗑️ [clearStorage] Clearing storage...');
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    
    // Verify
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);
    
    if (!token && !user) {
      console.log('✅ [clearStorage] Storage cleared successfully');
      return true;
    } else {
      console.error('❌ [clearStorage] Storage may not be fully cleared');
      return false;
    }
  } catch (error) {
    console.error('❌ [clearStorage] Error:', error.message);
    return false;
  }
};

// 🔍 Debug function - check storage state
export const debugStorage = async () => {
  try {
    console.log('🔍 ========== STORAGE DEBUG ==========');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 All keys in storage:', allKeys);
    
    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`🔍 ${key}:`, value?.substring(0, 50) || 'null');
    }
    
    console.log('🔍 Expected TOKEN_KEY:', TOKEN_KEY);
    console.log('🔍 Expected USER_KEY:', USER_KEY);
    console.log('🔍 ====================================');
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};