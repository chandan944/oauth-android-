import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 🔴 REPLACE THIS WITH YOUR ACTUAL WEB CLIENT ID
    // Get it from Google Cloud Console → Credentials → Web application client
    GoogleSignin.configure({
      webClientId: '726369306394-nc6s5p1esot3cgnfh2ikmjpukbbppii5.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    console.log('✅ Google Sign-In configured');
    
    // Check if user already signed in
    isSignedIn();
  }, []);

  const isSignedIn = async () => {
    const signedIn = await GoogleSignin.isSignedIn();
    if (signedIn) {
      getCurrentUser();
    }
  };

  const getCurrentUser = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      setUserInfo(userInfo);
    } catch (error) {
      console.log('No user signed in yet');
    }
  };

  const signIn = async () => {
    console.log('🚀 Starting Google Sign-In...');
    
    try {
      setLoading(true);

      // Check Play Services (Android only)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('✅ Play Services available');

      // Sign in
      const userInfo = await GoogleSignin.signIn();
      
      console.log('✅ Sign-in successful!');
      console.log('📧 Email:', userInfo.user.email);
      console.log('👤 Name:', userInfo.user.name);
      console.log('🔑 ID Token:', userInfo.idToken);
      console.log('🆔 User ID:', userInfo.user.id);

      setUserInfo(userInfo);

      Alert.alert(
        '🎉 Success!',
        `Welcome ${userInfo.user.name}!\n\nEmail: ${userInfo.user.email}`,
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      console.log('❌ Sign-in error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login');
        Alert.alert('Cancelled', 'You cancelled the sign-in process');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in in progress');
        Alert.alert('Please wait', 'Sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
        Alert.alert(
          'Error', 
          'Google Play Services is not available or outdated. Please update it from Play Store.'
        );
      } else {
        console.log('Unknown error:', error.message);
        Alert.alert('Error', `Sign-in failed:\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
      console.log('✅ User signed out successfully');
      Alert.alert('Signed Out', 'You have been signed out');
    } catch (error) {
      console.error('❌ Sign-out error:', error);
    }
  };

  const revokeAccess = async () => {
    try {
      await GoogleSignin.revokeAccess();
      setUserInfo(null);
      console.log('✅ Access revoked');
      Alert.alert('Access Revoked', 'App access has been revoked');
    } catch (error) {
      console.error('❌ Revoke error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Sign-In Demo 🚀</Text>
      
      {!userInfo ? (
        // Sign-In Button
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={signIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>🔐 Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        // User Info Card
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInfo.user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.userName}>{userInfo.user.name}</Text>
          <Text style={styles.userEmail}>{userInfo.user.email}</Text>
          
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>ID Token (first 50 chars):</Text>
            <Text style={styles.tokenText}>
              {userInfo.idToken?.substring(0, 50)}...
            </Text>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.buttonText}>🚪 Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.revokeButton} onPress={revokeAccess}>
            <Text style={styles.buttonText}>🔒 Revoke Access</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {!userInfo 
            ? '👆 Tap to sign in with your Google account' 
            : '✅ You are signed in!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  signInButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 250,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#a8c7fa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  tokenContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
  signOutButton: {
    backgroundColor: '#EA4335',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  revokeButton: {
    backgroundColor: '#FBBC04',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  infoBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});