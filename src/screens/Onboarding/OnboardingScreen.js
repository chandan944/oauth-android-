import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Express & Reflect Daily",
    description: "Pour your heart out in a safe, personal space. Track your emotional journey, celebrate victories, and learn from challenges.",
    icon: "journal",
    gradient: ["#667eea", "#764ba2", "#f093fb"],
    accentColor: "#7a0fe6",
    stats: [
      { icon: "calendar", label: "Daily Journaling", value: "Unlimited" },
      { icon: "eye", label: "Privacy Control", value: "Public/Private" },
      { icon: "heart", label: "Mood Tracking", value: "8 Moods" },
    ],
    features: [
      { icon: "create", text: "Write unlimited diary entries with rich formatting" },
      { icon: "happy", text: "Track 5 different mood types to understand patterns" },
      { icon: "lock-closed", text: "Choose public or private visibility for each entry" },
      { icon: "analytics", text: "View mood analytics and emotional trends over time" },
    ]
  },
  {
    id: "2",
    title: "Master Your Tasks",
    description: "Transform chaos into clarity. Organize, prioritize, and conquer your to-do list with powerful task management tools.",
    icon: "checkmark-done-circle",
    gradient: ["#11998e", "#38ef7d", "#a8ff78"],
    accentColor: "#2a7015",
    stats: [
      { icon: "list", label: "Task Lists", value: "Unlimited" },
      { icon: "flag", label: "Priority Levels", value: "High/Med/Low" },
      { icon: "stats-chart", label: "Completion Rate", value: "Real-time" },
    ],
    features: [
      { icon: "add-circle", text: "Create tasks with detailed descriptions and notes" },
      { icon: "ribbon", text: "Set priority levels (High, Medium, Low)" },
      
      { icon: "pie-chart", text: "Track completion rates with visual analytics" },
    ]
  },
  {
    id: "3",
    title: "Build Lasting Habits",
    description: "Small steps lead to big changes. Create positive habits, break bad ones, and watch your life transform day by day.",
    icon: "fitness",
    gradient: ["#fa709a", "#fee140", "#ffd89b"],
    accentColor: "#c03962",
    stats: [
      { icon: "infinite", label: "Habit Types", value: "Unlimited" },
      { icon: "flame", label: "Streak Tracking", value: "Daily" },
      { icon: "trophy", label: "Achievements", value: "Earned" },
    ],
    features: [
      { icon: "add", text: "Create custom daily habits tailored to your goals" },
      { icon: "checkbox", text: "Simple one-tap check-in to log daily progress" },
      { icon: "flash", text: "Build streaks to stay motivated and consistent" },
      { icon: "trending-up", text: "Visual charts show your habit consistency" },
    ]
  },
  {
    id: "4",
    title: "Achieve Dream Goals",
    description: "Turn aspirations into achievements. Set ambitious goals, track milestones, and celebrate every step of your success journey.",
    icon: "rocket",
    gradient: ["#ff6b6b", "#ffa500", "#ffd93d"],
    accentColor: "#e92a09",
    stats: [
      { icon: "trophy", label: "Active Goals", value: "Unlimited" },
      { icon: "trending-up", label: "Progress Tracking", value: "0-100%" },
      { icon: "checkmark-circle", label: "Milestones", value: "Custom" },
    ],
    features: [
      { icon: "star", text: "Set short-term and long-term personal goals" },
      { icon: "podium", text: "Track progress with percentage completion" },
      { icon: "notifications", text: "Update milestones and celebrate achievements" },
      { icon: "bar-chart", text: "Comprehensive dashboard to visualize all goals" },
    ]
  },
  {
    id: "5",
    title: "Stay Inspired Daily",
    description: "Fuel your motivation every day. Receive uplifting messages, connect with a supportive community, and keep your spirits high.",
    icon: "thunderstorm",
    gradient: ["#4a90e2", "#357abd", "#5f72bd"],
    accentColor: "#2b08ee",
    stats: [
      { icon: "mail", label: "Daily Messages", value: "Unlimited" },
      { icon: "people", label: "Community", value: "Active" },
      { icon: "chatbubbles", label: "Support", value: "24/7" },
    ],
    features: [
      
      { icon: "heart", text: "Share your progress with supportive community" },
      { icon: "bookmark", text: "Save favorite messages for tough days" },
      { icon: "share-social", text: "Inspire others by sharing your journey" },
    ]
  }
];

// Floating particles animation
const FloatingParticle = ({ delay, duration }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
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
      translateY.setValue(height);
      translateX.setValue(Math.random() * width);
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
};

// Animated statistics card
const StatCard = ({ stat, index, accentColor }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay: 600 + index * 100,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        delay: 600 + index * 100,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={stat.icon} size={20} color={accentColor} />
      </View>
     
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Animated.View>
  );
};

// Feature item with animation
const FeatureItem = ({ feature, index, accentColor }) => {
  const translateX = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        delay: 800 + index * 100,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        delay: 800 + index * 100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureItem,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      <View style={[styles.featureIconWrapper, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={feature.icon} size={18} color={accentColor} />
      </View>
      <Text style={styles.featureText}>{feature.text}</Text>
    </Animated.View>
  );
};

// Main slide component
const OnboardingSlide = ({ item }) => {
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.slide}
    >
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 1000} duration={8000 + i * 1000} />
      ))}

      <View style={styles.slideContent}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: iconScale }, { rotate }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.15)']}
            style={styles.iconGradient}
          >
            <Ionicons name={item.icon} size={70} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.iconGlow} />
        </Animated.View>

        

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {item.stats.map((stat, index) => (
            <StatCard 
              key={index} 
              stat={stat} 
              index={index} 
              accentColor={item.accentColor}
            />
          ))}
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featuresHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.featuresTitle}>Key Features</Text>
          </View>
          {item.features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              feature={feature} 
              index={index}
              accentColor={item.accentColor}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
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

    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace("Login");
    }
  };

  const skip = () => {
    navigation.replace("Login");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />

        {/* Footer with pagination and buttons */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={styles.footer}
        >
          {/* Page indicators */}
          <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: "clamp",
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: COLORS.white,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {onboardingData.length}
            </Text>
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skip}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={scrollToNext}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#ffffff', '#f0f0f0']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextText}>
                    {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
                  </Text>
                  <Ionicons 
                    name={currentIndex === onboardingData.length - 1 ? "checkmark-circle" : "arrow-forward"} 
                    size={22} 
                    color={onboardingData[currentIndex].accentColor}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  slide: {
    width: width,
    height: height,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 180,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  featureIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  nextButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
  },
  nextText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;