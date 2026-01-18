import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/colors";
import { ActivityIndicator, View } from "react-native";
import { isOnboardingComplete } from "../utils/storage";

// Onboarding Screen
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";

// Auth Screens
import LoginScreen from "../screens/Auth/LoginScreen";

// Diary Screens
import DiaryFeedScreen from "../screens/Diary/DiaryFeedScreen";
import MyDiariesScreen from "../screens/Diary/MyDiariesScreen";
import CreateDiaryScreen from "../screens/Diary/CreateDiaryScreen";
import EditDiaryScreen from "../screens/Diary/EditDiaryScreen";

// Analytics Screens
import MoodAnalyticsScreen from "../screens/Analytics/MoodAnalyticsScreen";
import ProgressDashboardScreen from "../screens/Analytics/ProgressDashboardScreen";

// Messages Screens
import MessagesScreen from "../screens/Messages/MessagesScreen";
import MessageDetailScreen from "../screens/Messages/MessageDetailScreen";
import CreateMessageScreen from "../screens/Messages/CreateMessageScreen";
import EditMessageScreen from "../screens/Messages/EditMessageScreen";

// Habits Screens
import HabitsScreen from "../screens/Habits/HabitsScreen";
import CreateHabitScreen from "../screens/Habits/CreateHabitScreen";
import HabitDetailScreen from "../screens/Habits/HabitDetailScreen";
import EditHabitScreen from "../screens/Habits/EditHabitScreen";

// Goals Screens
import GoalsScreen from "../screens/Goals/GoalsScreen";
import CreateGoalScreen from "../screens/Goals/CreateGoalScreen";
import GoalDetailScreen from "../screens/Goals/GoalDetailScreen";
import EditGoalScreen from "../screens/Goals/EditGoalScreen";

// Profile Screen
import ProfileScreen from "../screens/Profile/ProfileScreen";

// Todos Screens
import TodosScreen from "../screens/Todos/TodosScreen";
import CreateTodoScreen from "../screens/Todos/CreateTodoScreen";
import EditTodoScreen from "../screens/Todos/EditTodoScreen";
import TodoDetailScreen from "../screens/Todos/TodoDetailScreen";
import TodoAnalyticsScreen from "../screens/Todos/TodoAnalyticsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const TodosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#FEF1E7" },
      headerTintColor: COLORS.black,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="TodosList"
      component={TodosScreen}
      options={{ 
        title: "My Todos",
        headerLeft: () => (
          <Ionicons 
            name="checkbox" 
            size={24} 
            color={COLORS.black} 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="CreateTodo"
      component={CreateTodoScreen}
      options={{ title: "Create Todo" }}
    />
    <Stack.Screen
      name="EditTodo"
      component={EditTodoScreen}
      options={{ title: "Edit Todo" }}
    />
    <Stack.Screen
      name="TodoDetail"
      component={TodoDetailScreen}
      options={{ title: "Todo Details" }}
    />
    <Stack.Screen
      name="TodoAnalytics"
      component={TodoAnalyticsScreen}
      options={{ title: "Todo Analytics" }}
    />
  </Stack.Navigator>
);

const DiaryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#864703" },
      headerTintColor: "#f3f8f8",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="DiaryFeed"
      component={DiaryFeedScreen}
      options={{ 
        title: "Public Feed",
        headerLeft: () => (
          <Ionicons 
            name="home" 
            size={24} 
            color= "#f0f5f5" 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="MyDiaries"
      component={MyDiariesScreen}
      options={{ title: "My Diaries" }}
    />
    <Stack.Screen
      name="CreateDiary"
      component={CreateDiaryScreen}
      options={{ title: "Create Diary" }}
    />
    <Stack.Screen
      name="EditDiary"
      component={EditDiaryScreen}
      options={{ title: "Edit Diary" }}
    />
  </Stack.Navigator>
);

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
      options={{ 
        title: "Mood Analytics",
        headerLeft: () => (
          <Ionicons 
            name="pie-chart" 
            size={24} 
            color={COLORS.white} 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="ProgressDashboard"
      component={ProgressDashboardScreen}
      options={{ title: "Progress Dashboard" }}
    />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#0D0C0D" },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="MessagesList"
      component={MessagesScreen}
      options={{ 
        title: "Messages",
        headerLeft: () => (
          <Ionicons 
            name="chatbox" 
            size={24} 
            color={COLORS.white} 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="MessageDetail"
      component={MessageDetailScreen}
      options={{ title: "Message Details" }}
    />
    <Stack.Screen
      name="CreateMessage"
      component={CreateMessageScreen}
      options={{ title: "Create Message" }}
    />
    <Stack.Screen
      name="EditMessage"
      component={EditMessageScreen}
      options={{ title: "Edit Message" }}
    />
  </Stack.Navigator>
);

const HabitsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#F93434" },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="HabitsList"
      component={HabitsScreen}
      options={{ 
        title: "Habits",
        headerLeft: () => (
          <Ionicons 
            name="checkmark-circle" 
            size={24} 
            color={COLORS.white} 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="CreateHabit"
      component={CreateHabitScreen}
      options={{ title: "Create Habit" }}
    />
    <Stack.Screen
      name="HabitDetail"
      component={HabitDetailScreen}
      options={{ title: "Habit Details" }}
    />
    <Stack.Screen
      name="EditHabit"
      component={EditHabitScreen}
      options={{ title: "Edit Habit" }}
    />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#F7E664" },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="GoalsList"
      component={GoalsScreen}
      options={{ 
        title: "Goals",
        headerLeft: () => (
          <Ionicons 
            name="flag" 
            size={24} 
            color={COLORS.white} 
            style={{ marginLeft: 15 }} 
          />
        )
      }}
    />
    <Stack.Screen
      name="CreateGoal"
      component={CreateGoalScreen}
      options={{ title: "Create Goal" }}
    />
    <Stack.Screen
      name="GoalDetail"
      component={GoalDetailScreen}
      options={{ title: "Goal Details" }}
    />
    <Stack.Screen
      name="EditGoal"
      component={EditGoalScreen}
      options={{ title: "Edit Goal" }}
    />
  </Stack.Navigator>
);

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
          case "Todos":
            iconName = focused ? "checkbox" : "checkbox-outline";
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
      tabBarActiveTintColor: COLORS.black,
      tabBarInactiveTintColor: COLORS.grey,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        marginBottom: 40,
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
    <Tab.Screen name="Todos" component={TodosStack} />
    <Tab.Screen name="Habits" component={HabitsStack} />
    <Tab.Screen name="Goals" component={GoalsStack} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete();
      setOnboardingDone(completed);
    } catch (error) {
      console.error("Error checking onboarding:", error);
      setOnboardingDone(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (isLoading || checkingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.white,
        }}
      >
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