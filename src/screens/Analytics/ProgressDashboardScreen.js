import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getHabitDashboard } from "../../services/habitService";
import { getGoalDashboard } from "../../services/goalService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate } from "../../utils/helpers";

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

  const activeGoals =
    goalData?.goals?.filter((g) => g.goal?.status === "in_progress").length ||
    0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.summaryCard}>
        <Text style={styles.greeting}>Today's Progress</Text>
        <Text style={styles.date}>{formatDate(new Date())}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={COLORS.success}
            />
            <Text style={styles.statValue}>
              {completedHabits}/{totalHabits}
            </Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="flag" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{activeGoals}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habitData?.habits?.map((item) => (
          <View key={item.habit.id} style={styles.item}>
            <View
              style={[
                styles.statusDot,
                item.todayLog?.status === "completed"
                  ? styles.completedDot
                  : styles.pendingDot,
              ]}
            />
            <Text style={styles.itemTitle}>{item.habit.title}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Active Goals</Text>
        {goalData?.goals?.map((item) => (
          <View key={item.goal.id} style={styles.item}>
            <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.goal.title}</Text>
              <Text style={styles.itemSubtitle}>
                Progress: {item.todayProgress?.totalProgress || 0}%
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    margin: 16,
    padding: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  completedDot: {
    backgroundColor: COLORS.success,
  },
  pendingDot: {
    backgroundColor: COLORS.grey,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default ProgressDashboardScreen;
