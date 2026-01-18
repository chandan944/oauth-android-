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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Track Your Daily Moods",
    description: "Create personal diary entries to capture your thoughts, feelings, and daily experiences. Share publicly or keep them private.",
    icon: "book",
    gradient: ["#667eea", "#764ba2"],
    features: [
      "Write daily diary entries",
      "Track your mood patterns",
      "Share with community or keep private",
      "View your emotional journey"
    ]
  },
  {
    id: "2",
    title: "Manage Your Tasks",
    description: "Stay organized with our powerful todo system. Create, prioritize, and complete tasks efficiently to boost your productivity.",
    icon: "checkbox",
    gradient: ["#50E3C2", "#4ECDC4"],
    features: [
      "Create and organize todos",
      "Set priorities and deadlines",
      "Track completion status",
      "View analytics and insights"
    ]
  },
  {
    id: "3",
    title: "Build Better Habits",
    description: "Form positive habits and break bad ones. Track your daily progress and build streaks to stay motivated.",
    icon: "checkmark-circle",
    gradient: ["#F093FB", "#F5576C"],
    features: [
      "Create custom habits",
      "Daily habit tracking",
      "Build streaks and momentum",
      "Visual progress charts"
    ]
  },
  {
    id: "4",
    title: "Achieve Your Goals",
    description: "Set meaningful goals and track your progress. Break down big dreams into actionable steps and celebrate milestones.",
    icon: "flag",
    gradient: ["#FFA500", "#FF6B6B"],
    features: [
      "Set short & long-term goals",
      "Track progress percentage",
      "Update milestones",
      "Achievement dashboard"
    ]
  },
  {
    id: "5",
    title: "Get Motivated Daily",
    description: "Receive inspiring messages and motivational content. Stay encouraged on your personal growth journey.",
    icon: "chatbubbles",
    gradient: ["#4A90E2", "#357ABD"],
    features: [
      "Daily motivational messages",
      "Community support",
      "Inspiring content feed",
      "Share your progress"
    ]
  }
];

// Moved FloatingIcon outside to avoid hook issues
const FloatingIcon = ({ name, delay, top, left, size = 40, color }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        {
          top,
          left,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

// Simplified OnboardingSlide component without internal hooks
const OnboardingSlide = ({ item }) => {
  return (
    <LinearGradient
      colors={[...item.gradient, item.gradient[0]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.slide}
    >
      <FloatingIcon 
        name={item.icon} 
        delay={0} 
        top={80} 
        left={30} 
        size={30} 
        color="rgba(255,255,255,0.3)" 
      />
      <FloatingIcon 
        name={item.icon} 
        delay={500} 
        top={120} 
        left={width - 60} 
        size={25} 
        color="rgba(255,255,255,0.2)" 
      />
      <FloatingIcon 
        name={item.icon} 
        delay={1000} 
        top={height * 0.6} 
        left={50} 
        size={35} 
        color="rgba(255,255,255,0.25)" 
      />

      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.iconGradient}
          >
            <Ionicons name={item.icon} size={80} color={COLORS.white} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View
              key={index}
              style={styles.featureItem}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="rgba(255,255,255,0.9)" 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
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

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
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

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 30, 10],
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
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={scrollToNext}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>
                  {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={onboardingData[currentIndex].gradient[0]} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  floatingIcon: {
    position: "absolute",
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: height * 0.15,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  featuresContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: "600",
    flex: 1,
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
  },
  nextButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;