import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import api from './api';

GoogleSignin.configure({
  webClientId: '1036194311354-ccbr5d07s13jtpd2ffmhtdl6hdd43urq.apps.googleusercontent.com',
});

export const signInWithGoogleNative = async () => {
  console.log('🔐 Native Google Sign-In start');

  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();

  const idToken = result.data?.idToken || result.idToken;
  if (!idToken) throw new Error('No Google ID token');

  const credential = GoogleAuthProvider.credential(idToken);
  const userCred = await signInWithCredential(auth(), credential);

  console.log('✅ Firebase login success');

  // 🔥 SEND TOKEN TO BACKEND
  const response = await api.post('/auth/firebase', {
    firebaseIdToken: idToken,
    email: userCred.user.email,
    name: userCred.user.displayName,
    imageUrl: userCred.user.photoURL,
  });

  return response.data;
};
