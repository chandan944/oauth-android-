export const API_BASE_URL = 'http://192.168.43.112:8080';

export const ENDPOINTS = {

  // Diaries
  DIARIES: '/api/diaries',
  MY_DIARIES: '/api/diaries/me',
  PUBLIC_DIARIES: '/api/diaries/public',
  
  // Messages
  MESSAGES: '/api',
  MESSAGE_COMMENTS: (id) => `/api/${id}/comments`,
  ADMIN_MESSAGES: '/api/admin',
  
  // Habits
  HABITS: '/api/habits',
  MY_HABITS: '/api/habits/me',
  HABIT_LOG: '/api/habits/log',
  HABIT_DASHBOARD: '/api/habits/dashboard',
  HABIT_LOGS: (id) => `/api/habits/${id}/logs`,
  
  // Goals
  GOALS: '/api/goals',
  MY_GOALS: '/api/goals/me',
  GOAL_PROGRESS: '/api/goals/progress',
  GOAL_DASHBOARD: '/api/goals/dashboard',
  GOAL_PROGRESS_HISTORY: (id) => `/api/goals/${id}/progress`,
};


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
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('ℹ️ No existing authentication found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

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
        const token = response.data.token;

        // IMPORTANT: Save token first and WAIT for it to complete
        await saveToken(token);
        console.log('💾 Token saved to storage');

        // Set token in API headers IMMEDIATELY
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token set in API headers');

        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          imageUrl: backendUser.imageUrl || '',
          role: backendUser.role || 'USER',
        };

        // Save user data
        await saveUser(userData);
        console.log('💾 User data saved to storage');

        // Update state - this will trigger re-renders
        setUser(userData);
        setIsAuthenticated(true);

        console.log('🎉 Authentication complete!');
        
        // Add a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
      // Clear storage
      await clearStorage();
      
      // Remove auth header from API
      delete api.defaults.headers.common['Authorization'];
      
      // Update state
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


import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/colors";
import { ActivityIndicator, View } from "react-native";

// Auth Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

// Main Screens
import DiaryFeedScreen from "../screens/Diary/DiaryFeedScreen";
import MyDiariesScreen from "../screens/Diary/MyDiariesScreen";
import CreateDiaryScreen from "../screens/Diary/CreateDiaryScreen";
import MoodAnalyticsScreen from "../screens/Analytics/MoodAnalyticsScreen";
import ProgressDashboardScreen from "../screens/Analytics/ProgressDashboardScreen";
import MessagesScreen from "../screens/Messages/MessagesScreen";
import MessageDetailScreen from "../screens/Messages/MessageDetailScreen";
import HabitsScreen from "../screens/Habits/HabitsScreen";
import CreateHabitScreen from "../screens/Habits/CreateHabitScreen";
import HabitDetailScreen from "../screens/Habits/HabitDetailScreen";
import GoalsScreen from "../screens/Goals/GoalsScreen";
import CreateGoalScreen from "../screens/Goals/CreateGoalScreen";
import GoalDetailScreen from "../screens/Goals/GoalDetailScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
// Auth Stack - Only Login (No Register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);
// Diary Stack
const DiaryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="DiaryFeed"
      component={DiaryFeedScreen}
      options={{ title: "📖 Public Feed" }}
    />
    <Stack.Screen
      name="MyDiaries"
      component={MyDiariesScreen}
      options={{ title: "📝 My Diaries" }}
    />
    <Stack.Screen
      name="CreateDiary"
      component={CreateDiaryScreen}
      options={{ title: "✍️ Create Diary" }}
    />
  </Stack.Navigator>
);

// Analytics Stack
const AnalyticsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="MoodAnalytics"
      component={MoodAnalyticsScreen}
      options={{ title: "📊 Mood Analytics" }}
    />
    <Stack.Screen
      name="ProgressDashboard"
      component={ProgressDashboardScreen}
      options={{ title: "📈 Progress" }}
    />
  </Stack.Navigator>
);

// Messages Stack
const MessagesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="MessagesList"
      component={MessagesScreen}
      options={{ title: "📢 Messages" }}
    />
    <Stack.Screen
      name="MessageDetail"
      component={MessageDetailScreen}
      options={{ title: "💬 Message" }}
    />
  </Stack.Navigator>
);

// Habits Stack
const HabitsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="HabitsList"
      component={HabitsScreen}
      options={{ title: "🔁 Habits" }}
    />
    <Stack.Screen
      name="CreateHabit"
      component={CreateHabitScreen}
      options={{ title: "➕ Create Habit" }}
    />
    <Stack.Screen
      name="HabitDetail"
      component={HabitDetailScreen}
      options={{ title: "📊 Habit Details" }}
    />
  </Stack.Navigator>
);

// Goals Stack
const GoalsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="GoalsList"
      component={GoalsScreen}
      options={{ title: "🎯 Goals" }}
    />
    <Stack.Screen
      name="CreateGoal"
      component={CreateGoalScreen}
      options={{ title: "➕ Create Goal" }}
    />
    <Stack.Screen
      name="GoalDetail"
      component={GoalDetailScreen}
      options={{ title: "📊 Goal Details" }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case "Diary":
            iconName = focused ? "book" : "book-outline";
            break;
          case "Analytics":
            iconName = focused ? "stats-chart" : "stats-chart-outline";
            break;
          case "Messages":
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            break;
          case "Habits":
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
            break;
          case "Goals":
            iconName = focused ? "flag" : "flag-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          default:
            iconName = "circle";
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.grey,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        marginBottom:20,
        height: 60,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
      },
    })}
  >
    <Tab.Screen name="Diary" component={DiaryStack} />
    <Tab.Screen name="Analytics" component={AnalyticsStack} />
    <Tab.Screen name="Messages" component={MessagesStack} />
    <Tab.Screen name="Habits" component={HabitsStack} />
    <Tab.Screen name="Goals" component={GoalsStack} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getPublicDiaries } from "../../services/diaryService";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const DiaryFeedScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [needsAuth, setNeedsAuth] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Load diaries when component mounts
  useEffect(() => {
    loadDiaries();
  }, []);

  // Reload when authentication state changes
  useEffect(() => {
    if (isAuthenticated && needsAuth) {
      console.log('🔄 User authenticated, reloading diaries...');
      setNeedsAuth(false);
      loadDiaries();
    }
  }, [isAuthenticated]);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isAuthenticated) {
        console.log('👀 Screen focused, reloading diaries...');
        loadDiaries();
      }
    });
    return unsubscribe;
  }, [navigation, isAuthenticated]);

  const loadDiaries = async () => {
    try {
      console.log('📖 Loading public diaries... (Authenticated:', isAuthenticated, ')');
      
      const response = await getPublicDiaries(page, 10);
      
      // Check if response indicates auth is needed
      if (response.error || response.message) {
        console.log('⚠️ Auth required for public diaries');
        setNeedsAuth(true);
        setDiaries([]);
      } else {
        console.log('✅ Public diaries loaded:', response.content?.length || 0);
        setDiaries(response.content || []);
        setNeedsAuth(false);
      }
    } catch (error) {
      console.error("❌ Error loading public diaries:", error);
      
      // Don't show error alert, just update UI state
      setNeedsAuth(true);
      setDiaries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadDiaries();
  };

  const handleCreateDiary = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to create diary entries',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate("CreateDiary");
  };

  const handleMyDiaries = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to view your diaries',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate("MyDiaries");
  };

  const renderDiary = ({ item }) => (
    <Card>
      <View style={styles.diaryHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.authorName?.charAt(0) || "A"}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <Text style={styles.date}>{formatDate(item.entryDate)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: MOOD_COLORS[item.mood] + "20" },
          ]}
        >
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood]}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{truncateText(item.goodThings, 150)}</Text>

      <View style={styles.publicBadgeContainer}>
        <Ionicons name="globe-outline" size={14} color={COLORS.success} />
        <Text style={styles.publicBadgeText}>Public</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.myDiariesButton}
          onPress={handleMyDiaries}
        >
          <Ionicons name="book" size={20} color={COLORS.primary} />
          <Text style={styles.myDiariesText}>My Diaries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateDiary}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.viewInfo}>
        <Ionicons name="globe" size={20} color={COLORS.primary} />
        <Text style={styles.viewInfoText}>
          Viewing Public Diaries from Community
        </Text>
      </View>

      {/* Show auth required message if needed */}
      {needsAuth && !isAuthenticated && (
        <View style={styles.authRequiredBanner}>
          <Ionicons name="lock-closed" size={24} color={COLORS.warning} />
          <View style={styles.authRequiredContent}>
            <Text style={styles.authRequiredTitle}>Login Required</Text>
            <Text style={styles.authRequiredText}>
              Please log in to view public diaries from the community
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={diaries}
        renderItem={renderDiary}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          needsAuth ? (
            <EmptyState
              icon="lock-closed-outline"
              title="Login to View Diaries"
              message="Public diaries from the community will appear here once you log in"
            />
          ) : (
            <EmptyState
              icon="book-outline"
              title="No Public Diaries Yet"
              message="Be the first to share your thoughts with the community!"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  myDiariesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: 20,
  },
  myDiariesText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.success + "10",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  viewInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  authRequiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 16,
    backgroundColor: COLORS.warning + "15",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  authRequiredContent: {
    flex: 1,
    marginLeft: 12,
  },
  authRequiredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  authRequiredText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  list: {
    padding: 16,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  publicBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.success + "20",
    borderRadius: 12,
    marginBottom: 12,
  },
  publicBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.grey,
  },
});

export default DiaryFeedScreen;



import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.43.112:8080', // Change to your backend IP
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


























// import axios from 'axios';
// import { API_BASE_URL } from '../constants/config';
// import { getToken } from '../utils/storage';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor - Add token to all requests
// api.interceptors.request.use(
//   async (config) => {
//     const token = await getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log('📤 API Request:', config.method.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors globally
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Response:', response.config.url, response.status);
//     return response;
//   },
//   (error) => {
//     console.error('❌ API Error:', error.response?.status, error.response?.data);
    
//     // Handle specific error codes
//     if (error.response?.status === 401) {
//       // Token expired or invalid - redirect to login
//       console.log('🔒 Unauthorized - Token may be expired');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;


import api from './api';

export const sendGoogleTokenToBackend = async (authData) => {
  console.log('📤 Sending Google token to backend...');
  console.log('🔗 Backend URL:', api.defaults.baseURL + '/auth/google');
  console.log('👤 User:', authData?.email || 'No email');

  // Validate authData
  if (!authData || !authData.email || !authData.idToken) {
    throw new Error('Invalid authentication data');
  }

  try {
    const response = await api.post('/auth/google', {
      idToken: authData.idToken,
      email: authData.email,
      name: authData.name,
      imageUrl: authData.imageUrl,
    });

    console.log('✅ Backend response status:', response.status);
    console.log('📥 Backend response data:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Backend request failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    throw error;
  }
};


import api from './api';

export const sendGoogleTokenToBackend = async (authData) => {
  console.log('📤 Sending Google token to backend...');
  console.log('🔗 Backend URL:', api.defaults.baseURL + '/auth/google');
  console.log('👤 User:', authData?.email || 'No email');

  // Validate authData
  if (!authData || !authData.email || !authData.idToken) {
    throw new Error('Invalid authentication data');
  }

  try {
    const response = await api.post('/auth/google', {
      idToken: authData.idToken,
      email: authData.email,
      name: authData.name,
      imageUrl: authData.imageUrl,
    });

    console.log('✅ Backend response status:', response.status);
    console.log('📥 Backend response data:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Backend request failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    throw error;
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from './api'; // Use the centralized api instance

// ⚙️ Configuration
const API_URL = `${api.defaults.baseURL}/api/diaries`;

// 🔧 Helper function to get auth headers
const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️ No token found in storage');
      return null;
    }
    
    console.log('✅ Token retrieved from storage');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

// ============================================
// 📝 CREATE OR UPDATE TODAY'S DIARY
// ============================================
export const createOrUpdateDiary = async (diaryData) => {
  try {
    const headers = await getAuthHeaders();
    
    if (!headers) {
      throw new Error('Authentication required. Please log in.');
    }
    
    console.log('📤 Creating/Updating diary...');
    const response = await axios.post(
      API_URL,
      {
        title: diaryData.title,
        goodThings: diaryData.goodThings,
        badThings: diaryData.badThings || '',
        mood: diaryData.mood,
        visibility: diaryData.visibility || 'PUBLIC',
      },
      { headers }
    );
    
    console.log('✅ Diary saved successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error creating/updating diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 📖 GET TODAY'S DIARY ENTRY
// ============================================
export const getTodayDiary = async () => {
  try {
    const headers = await getAuthHeaders();
    
    if (!headers) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const response = await axios.get(`${API_URL}/today`, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('❌ Error fetching today diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 👤 GET MY DIARIES (PAGINATED)
// ============================================
export const getMyDiaries = async (page = 0, size = 10) => {
  try {
    const headers = await getAuthHeaders();
    
    if (!headers) {
      throw new Error('Authentication required. Please log in.');
    }
    
    console.log('📚 Fetching my diaries...');
    const response = await axios.get(`${API_URL}/me`, {
      params: { page, size },
      headers,
    });
    
    console.log('✅ My diaries loaded:', response.data?.content?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching my diaries:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 🌍 GET PUBLIC DIARIES FEED (PAGINATED)
// ============================================
// Updated: Your backend requires authentication even for public endpoint
export const getPublicDiaries = async (page = 0, size = 10) => {
  try {
    // ALWAYS try to get auth headers - your backend requires them
    const headers = await getAuthHeaders();
    
    if (!headers) {
      console.log('⚠️ No authentication - cannot load public diaries');
      // Return empty instead of error since user might not be logged in yet
      return { 
        content: [], 
        totalElements: 0, 
        totalPages: 0,
        message: 'Please log in to view diaries'
      };
    }
    
    console.log('📖 Loading public diaries with authentication...');
    
    const response = await axios.get(`${API_URL}/public`, {
      params: { page, size },
      headers,
    });
    
    console.log('✅ Public diaries loaded:', response.data?.content?.length || 0);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error fetching public diaries:', error.response?.data || error.message);
    
    // Handle authentication errors gracefully
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('⚠️ Auth required for public diaries');
      return { 
        content: [], 
        totalElements: 0, 
        totalPages: 0,
        error: 'Authentication required'
      };
    }
    
    throw error;
  }
};

// ============================================
// ✏️ UPDATE SPECIFIC DIARY BY ID
// ============================================
export const updateDiaryById = async (id, updateData) => {
  try {
    const headers = await getAuthHeaders();
    
    if (!headers) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const response = await axios.put(
      `${API_URL}/${id}`,
      {
        title: updateData.title,
        goodThings: updateData.goodThings,
        badThings: updateData.badThings,
        mood: updateData.mood,
        visibility: updateData.visibility,
      },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to update this diary');
    }
    console.error('❌ Error updating diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 🗑️ DELETE DIARY BY ID
// ============================================
export const deleteDiary = async (id) => {
  try {
    const headers = await getAuthHeaders();
    
    if (!headers) {
      throw new Error('Authentication required. Please log in.');
    }
    
    await axios.delete(`${API_URL}/${id}`, { headers });
    
    return { success: true, message: 'Diary deleted successfully' };
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to delete this diary');
    }
    if (error.response?.status === 404) {
      throw new Error('Diary not found');
    }
    console.error('❌ Error deleting diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 📊 HELPER: Get Diary Statistics
// ============================================
export const getDiaryStats = (diaries) => {
  if (!diaries || diaries.length === 0) {
    return {
      totalEntries: 0,
      moodDistribution: {},
      currentStreak: 0,
    };
  }

  const moodDistribution = {};
  diaries.forEach((diary) => {
    const mood = diary.mood || 'NEUTRAL';
    moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
  });

  return {
    totalEntries: diaries.length,
    moodDistribution,
    currentStreak: calculateStreak(diaries),
  };
};

// Helper function to calculate consecutive days streak
const calculateStreak = (diaries) => {
  if (!diaries || diaries.length === 0) return 0;

  const sortedDiaries = [...diaries].sort(
    (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
  );

  let streak = 1;
  for (let i = 0; i < sortedDiaries.length - 1; i++) {
    const currentDate = new Date(sortedDiaries[i].entryDate);
    const previousDate = new Date(sortedDiaries[i + 1].entryDate);
    const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// ============================================
// 🔍 EXPORT ALL FUNCTIONS
// ============================================
export default {
  createOrUpdateDiary,
  getTodayDiary,
  getMyDiaries,
  getPublicDiaries,
  updateDiaryById,
  deleteDiary,
  getDiaryStats,
};

eas credentials