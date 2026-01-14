import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import { getHabitDashboard } from "../../services/habitService";
import { getGoalDashboard } from "../../services/goalService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate } from "../../utils/helpers";

const { width } = Dimensions.get("window");

const CircularProgress = ({ completed, total, color, label }) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const progress = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularTextContainer}>
        <Text style={[styles.circularValue, { color }]}>
          {completed}/{total}
        </Text>
        <Text style={styles.circularLabel}>{label}</Text>
      </View>
    </View>
  );
};

const StatCard = ({ icon, value, label, color, bgColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProgressDashboardScreen = () => {
  const [habitData, setHabitData] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [habits, goals] = await Promise.all([
        getHabitDashboard(),
        getGoalDashboard(),
      ]);
      setHabitData(habits);
      setGoalData(goals);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) return <LoadingSpinner />;

  const completedHabits =
    habitData?.habits?.filter((h) => h.todayLog?.status === "completed")
      .length || 0;
  const totalHabits = habitData?.habits?.length || 0;
  const completionRate = totalHabits > 0
    ? Math.round((completedHabits / totalHabits) * 100)
    : 0;

  const activeGoals =
    goalData?.goals?.filter((g) => g.goal?.status === "in_progress").length || 0;
  const completedGoals =
    goalData?.goals?.filter((g) => g.goal?.status === "completed").length || 0;

  const avgGoalProgress = goalData?.goals?.length > 0
    ? Math.round(
        goalData.goals.reduce((acc, item) => acc + (item.todayProgress?.totalProgress || 0), 0) /
          goalData.goals.length
      )
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi there! 👋</Text>
          <Text style={styles.headerDate}>{formatDate(new Date())}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={24} color="#FF6B6B" />
          <Text style={styles.streakText}>0</Text>
        </View>
      </View>

      {/* Progress Circles */}
      <View style={styles.progressSection}>
        <CircularProgress
          completed={completedHabits}
          total={totalHabits}
          color="#4CAF50"
          label="Habits"
        />
        <CircularProgress
          completed={activeGoals}
          total={activeGoals + completedGoals}
          color="#6C5CE7"
          label="Goals"
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="checkmark-done"
          value={`${completionRate}%`}
          label="Completion"
          color="#4CAF50"
          bgColor="#E8F5E9"
        />
        <StatCard
          icon="trending-up"
          value={`${avgGoalProgress}%`}
          label="Avg Progress"
          color="#2196F3"
          bgColor="#E3F2FD"
        />
        <StatCard
          icon="trophy"
          value={completedGoals}
          label="Achieved"
          color="#FFA726"
          bgColor="#FFF3E0"
        />
      </View>

      {/* Today's Habits */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {completedHabits}/{totalHabits}
            </Text>
          </View>
        </View>

        {habitData?.habits && habitData.habits.length > 0 ? (
          habitData.habits.map((item, index) => (
            <TouchableOpacity
              key={item.habit.id}
              style={[
                styles.habitItem,
                index === habitData.habits.length - 1 && styles.habitItemLast,
              ]}
            >
              <View style={styles.habitLeft}>
                <View
                  style={[
                    styles.checkCircle,
                    item.todayLog?.status === "completed" && styles.checkCircleCompleted,
                  ]}
                >
                  {item.todayLog?.status === "completed" && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{item.habit.title}</Text>
                  <Text style={styles.habitTarget}>Target: {item.habit.targetValue}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  item.todayLog?.status === "completed"
                    ? styles.statusCompleted
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.todayLog?.status === "completed"
                      ? styles.statusTextCompleted
                      : styles.statusTextPending,
                  ]}
                >
                  {item.todayLog?.status === "completed" ? "Done" : "Pending"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No habits yet</Text>
          </View>
        )}
      </Card>

      {/* Active Goals */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeGoals}</Text>
          </View>
        </View>

        {goalData?.goals && goalData.goals.length > 0 ? (
          goalData.goals.map((item, index) => (
            <TouchableOpacity
              key={item.goal.id}
              style={[
                styles.goalItem,
                index === goalData.goals.length - 1 && styles.goalItemLast,
              ]}
            >
              <View style={styles.goalLeft}>
                <View style={styles.goalIconContainer}>
                  <Ionicons name="flag" size={20} color="#6C5CE7" />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{item.goal.title}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.todayProgress?.totalProgress || 0}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <Text style={styles.goalPercentage}>
                {item.todayProgress?.totalProgress || 0}%
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No goals yet</Text>
          </View>
        )}
      </Card>

      {/* Motivation Quote */}
      <Card style={styles.quoteCard}>
        <Ionicons name="bulb" size={24} color="#FFA726" />
        <Text style={styles.quoteText}>
          "The secret of getting ahead is getting started."
        </Text>
        <Text style={styles.quoteAuthor}>- Mark Twain</Text>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#6C5CE7",
    padding: 24,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  progressSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 32,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  circularProgressContainer: {
    alignItems: "center",
  },
  circularTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  circularValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  circularLabel: {
    fontSize: 12,
    color: "#636E72",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#636E72",
    textAlign: "center",
  },
  sectionCard: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
  },
  countBadge: {
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6C5CE7",
  },
  habitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  habitItemLast: {
    borderBottomWidth: 0,
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  habitTarget: {
    fontSize: 13,
    color: "#636E72",
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#E8F5E9",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextCompleted: {
    color: "#4CAF50",
  },
  statusTextPending: {
    color: "#FFA726",
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  goalItemLast: {
    borderBottomWidth: 0,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 3,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6C5CE7",
    marginLeft: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 12,
  },
  quoteCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    padding: 24,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#2D3436",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 13,
    color: "#636E72",
    fontWeight: "600",
  },
});

export default ProgressDashboardScreen;