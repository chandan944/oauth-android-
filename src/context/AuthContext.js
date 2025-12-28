import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '../utils/storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 Checking authentication status...');
    try {
      const token = await getToken();
      const userData = await getUser();

      if (token && userData) {
        console.log('✅ User already authenticated:', userData.email);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('ℹ️ No existing authentication found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed: Accept authData object instead of separate parameters
  const handleGoogleAuth = async (authData) => {
    console.log('🔐 Processing Google authentication...');
    
    // Validate authData exists and has required fields
    if (!authData || !authData.email) {
      console.error('❌ Invalid authData:', authData);
      return {
        success: false,
        message: 'Invalid authentication data'
      };
    }

    console.log('👤 User email:', authData.email);

    try {
      console.log('📤 Sending to backend:', api.defaults.baseURL + '/auth/google');
      
      const response = await api.post('/auth/google', {
        idToken: authData.idToken,
        email: authData.email,
        name: authData.name,
        imageUrl: authData.imageUrl,
      });

      console.log('📥 Backend response:', response.data);

      if (response.data && response.data.success && response.data.token) {
        console.log('✅ JWT token received from backend');
        
        const backendUser = response.data.user;

        await saveToken(response.data.token);
        console.log('💾 Token saved to storage');

        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          imageUrl: backendUser.imageUrl || '',
          role: backendUser.role || 'USER',
        };

        await saveUser(userData);
        console.log('💾 User data saved to storage');

        setUser(userData);
        setIsAuthenticated(true);

        console.log('🎉 Authentication complete!');
        return { success: true };
      }

      console.error('❌ No token in backend response');
      return { success: false, message: 'No token received from backend' };
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Authentication failed';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    console.log('👋 Logging out...');
    try {
      await clearStorage();
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    handleGoogleAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};