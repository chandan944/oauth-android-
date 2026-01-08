import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { handleGoogleAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '726369306394-nc6s5p1esot3cgnfh2ikmjpukbbppii5.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    console.log('✅ Google Sign-In configured');
  }, []);

  // Auto-navigate when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎉 User is authenticated, navigation will be handled by AppNavigator');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    console.log('🚀 Starting Google Sign In...');
    setLoading(true);

    try {
      // Check Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Play Services available');

      // Sign in with Google
      const result = await GoogleSignin.signIn();
      console.log('✅ Sign-in successful!');
      console.log('📦 Full result structure check');

      // Extract user data - handle multiple possible structures
      let user, idToken;
      
      if (result.data) {
        // New structure: result.data contains user and idToken
        user = result.data.user;
        idToken = result.data.idToken;
        console.log('📍 Using result.data structure');
      } else if (result.user) {
        // Alternative structure
        user = result.user;
        idToken = result.idToken;
        console.log('📍 Using result.user structure');
      } else {
        // Fallback: result itself is the user object
        user = result;
        idToken = result.idToken;
        console.log('📍 Using result as user structure');
      }

      // Validate required fields
      if (!user) {
        throw new Error('No user data received from Google');
      }

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      if (!user.email) {
        throw new Error('No email received from Google');
      }

      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name || user.givenName || 'No name provided');
      console.log('🖼️ Photo:', user.photo || user.photoUrl || 'No photo provided');
      console.log('🔑 ID Token received');

      // Prepare data for backend with all required fields
      const authData = {
        idToken: idToken,
        email: user.email,
        name: user.name || user.givenName || user.displayName || 'User',
        imageUrl: user.photo || user.photoUrl || user.picture || '',
        id: user.id || '',
      };

      console.log('📤 Sending to backend with authData:', {
        hasIdToken: !!authData.idToken,
        email: authData.email,
        name: authData.name,
        hasImage: !!authData.imageUrl,
      });

      // Send to backend - FIXED: Pass authData as single object
      const authResult = await handleGoogleAuth(authData);

      if (!authResult.success) {
        Alert.alert('Login Failed', authResult.message || 'Authentication failed');
      } else {
        console.log('🎉 Login successful! User will be redirected automatically.');
        // Note: Navigation is handled automatically by AppNavigator when isAuthenticated becomes true
      }

    } catch (error) {
      console.log('❌ Sign-in error:', error);
      console.log('❌ Error details:', {
        message: error.message,
        code: error.code,
      });

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Please wait', 'Sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Error',
          'Google Play Services is not available or outdated. Please update it from Play Store.'
        );
      } else {
        Alert.alert('Error', error.message || 'Sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🌟</Text>
          <Text style={styles.appName}>Self Help</Text>
          <Text style={styles.tagline}>Your Personal Growth Companion</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="book" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Track Your Mood</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Build Habits</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flag" size={32} color={COLORS.white} />
            <Text style={styles.featureText}>Achieve Goals</Text>
          </View>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 8,
    textAlign: 'center',
  },
  authSection: {
    alignItems: 'center',
  },
  googleButton: {
     marginBottom:40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
   
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default LoginScreen;