import React, { useState, useEffect, useRef } from "react";
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
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../utils/colors";
import { setOnboardingComplete } from "../../utils/storage";

const { width, height } = Dimensions.get("window");

const AnimatedFeature = ({ icon, text, color, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        friction: 6,
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
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[color + '30', color + '10']}
        style={styles.featureIconContainer}
      >
        <Ionicons name={icon} size={32} color={color} />
      </LinearGradient>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

const FloatingOrb = ({ delay, size, top, left, colors }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 4000 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 4000 + delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        style={styles.orbGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

const ParticleEffect = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 3000,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start(() => {
      translateY.setValue(0);
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY }],
          left: Math.random() * width,
        },
      ]}
    />
  );
};

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { handleGoogleAuth, isAuthenticated } = useAuth();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mark onboarding as complete when user reaches login screen
    setOnboardingComplete();

    GoogleSignin.configure({
      webClientId:
        "726369306394-nc6s5p1esot3cgnfh2ikmjpukbbppii5.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGoogleSignIn = async () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.92,
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
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const result = await GoogleSignin.signIn();

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
        throw new Error("Invalid authentication data received");
      }

      const authData = {
        idToken: idToken,
        email: user.email,
        name: user.name || user.givenName || user.displayName || "User",
        imageUrl: user.photo || user.photoUrl || user.picture || "",
        id: user.id || "",
      };

      const authResult = await handleGoogleAuth(authData);

      if (!authResult.success) {
        Alert.alert(
          "Login Failed",
          authResult.message || "Authentication failed"
        );
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Please wait", "Sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          "Error",
          "Google Play Services is not available or outdated. Please update it from Play Store."
        );
      } else {
        Alert.alert("Error", error.message || "Sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#fccb90']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Floating Background Orbs */}
        <FloatingOrb 
          delay={0} 
          size={150} 
          top={80} 
          left={-50} 
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} 
        />
        <FloatingOrb 
          delay={500} 
          size={100} 
          top={height * 0.25} 
          left={width - 70} 
          colors={['rgba(252,203,144,0.2)', 'rgba(252,203,144,0.08)']} 
        />
        <FloatingOrb 
          delay={1000} 
          size={120} 
          top={height * 0.5} 
          left={30} 
          colors={['rgba(240,147,251,0.2)', 'rgba(240,147,251,0.08)']} 
        />
        <FloatingOrb 
          delay={1500} 
          size={80} 
          top={height * 0.7} 
          left={width - 100} 
          colors={['rgba(102,126,234,0.2)', 'rgba(102,126,234,0.08)']} 
        />

        {/* Particle Effects */}
        {[...Array(8)].map((_, i) => (
          <ParticleEffect key={i} delay={i * 400} />
        ))}

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoSection,
              { transform: [{ scale: logoScale }, { rotate }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.15)']}
                style={styles.logoGradient}
              >
                <Image
                  source={require("../../../assets/icon.png")}
                  style={styles.logoImage}
                />
              </LinearGradient>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.appName}>Self Help</Text>
              <View style={styles.taglineContainer}>
                <Ionicons name="sparkles" size={14} color="#FFD700" />
                <Text style={styles.tagline}>Your Personal Growth Companion</Text>
                <Ionicons name="sparkles" size={14} color="#FFD700" />
              </View>
            </View>
          </Animated.View>

          <View style={styles.features}>
            <AnimatedFeature 
              icon="happy" 
              text="Track Mood" 
              color="#FF6B9D" 
              delay={400} 
            />
            <AnimatedFeature
              icon="checkmark-circle"
              text="Build Habits"
              color="#50E3C2"
              delay={600}
            />
            <AnimatedFeature 
              icon="flag" 
              text="Achieve Goals" 
              color="#FFA500" 
              delay={800} 
            />
          </View>

          <Animated.View
            style={[
              styles.authSection,
              {
                opacity: buttonOpacity,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.benefitText}>100% Secure & Private</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.benefitText}>Instant Access</Text>
              </View>
              
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                loading && styles.googleButtonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9fa', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.googleButtonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.loadingText}>Signing you in...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Ionicons name="logo-google" size={26} color="#DB4437" />
                    </View>
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#667eea" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

           
            
          </Animated.View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingOrb: {
    position: "absolute",
    borderRadius: 1000,
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 10,
    paddingTop: height * 0.12,
    paddingBottom: 10,
  },
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  logoGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: "contain",
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 15,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 50,
    paddingHorizontal: 10,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authSection: {
    alignItems: "center",
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  googleButton: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
     marginBottom:150
  },
  googleButtonDisabled: {
    opacity: 0.7,
     marginBottom:150
  },
  googleButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
   
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#DB4437",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  googleButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
    marginLeft: 12,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  termsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default LoginScreen;