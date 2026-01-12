import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';

const { width } = Dimensions.get('window');

const AnimatedFeature = ({ icon, text, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.feature,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={28} color={COLORS.white} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

const FloatingOrb = ({ delay, size, top, left }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Animated.View
      style={[
        styles.floatingOrb,
        {
          width: size,
          height: size,
          top,
          left,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { handleGoogleAuth, isAuthenticated } = useAuth();
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '726369306394-nc6s5p1esot3cgnfh2ikmjpukbbppii5.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    console.log('✅ Google Sign-In configured');

    // Entrance animations
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎉 User is authenticated, navigation will be handled by AppNavigator');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    console.log('🚀 Starting Google Sign In...');
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Play Services available');

      const result = await GoogleSignin.signIn();
      console.log('✅ Sign-in successful!');

      let user, idToken;
      
      if (result.data) {
        user = result.data.user;
        idToken = result.data.idToken;
      } else if (result.user) {
        user = result.user;
        idToken = result.idToken;
      } else {
        user = result;
        idToken = result.idToken;
      }

      if (!user || !idToken || !user.email) {
        throw new Error('Invalid authentication data received');
      }

      const authData = {
        idToken: idToken,
        email: user.email,
        name: user.name || user.givenName || user.displayName || 'User',
        imageUrl: user.photo || user.photoUrl || user.picture || '',
        id: user.id || '',
      };

      const authResult = await handleGoogleAuth(authData);

      if (!authResult.success) {
        Alert.alert('Login Failed', authResult.message || 'Authentication failed');
      } else {
        console.log('🎉 Login successful!');
      }

    } catch (error) {
      console.log('❌ Sign-in error:', error);

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
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Floating Background Orbs */}
      <FloatingOrb delay={0} size={120} top={100} left={-40} />
      <FloatingOrb delay={500} size={80} top={200} left={width - 60} />
      <FloatingOrb delay={1000} size={100} top={400} left={40} />
      <FloatingOrb delay={1500} size={60} top={600} left={width - 80} />

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoSection,
            { transform: [{ scale: logoScale }] }
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.logoGradient}
            >
               <Image
    source={require("../../../assets/icon.png")} // or uri
    style={styles.logoImage}
  />
            </LinearGradient>
          </View>
          
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Your Personal Growth Companion</Text>
          </View>
        </Animated.View>

        <View style={styles.features}>
          <AnimatedFeature icon="book" text="Track Mood" delay={300} />
          <AnimatedFeature icon="checkmark-circle" text="Build Habits" delay={500} />
          <AnimatedFeature icon="flag" text="Achieve Goals" delay={700} />
        </View>

        <Animated.View 
          style={[
            styles.authSection,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.googleButtonGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                 
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.securityText}>Secure Authentication</Text>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoImage: {
  width: 130,
  height: 130,
  borderRadius:90,
  resizeMode: "contain",
},

  logoGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 72,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  taglineContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagline: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
    paddingHorizontal: 10,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  authSection: {
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  googleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#DB4437',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  securityText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default LoginScreen;