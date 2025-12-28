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
