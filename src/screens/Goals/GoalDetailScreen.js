import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ProgressChart } from "react-native-chart-kit";
import {
  getGoal,
  logProgress,
  getProgressHistory,
} from "../../services/goalService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, daysLeft, calculateProgress } from "../../utils/helpers";
import { Dimensions } from "react-native";

const GoalDetailScreen = ({ route }) => {
  const { goalId } = route.params;
  const [goal, setGoal] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayProgress, setTodayProgress] = useState("");
  const [totalProgress, setTotalProgress] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    loadGoalData();
  }, []);

  const loadGoalData = async () => {
    try {
      const [goalData, history] = await Promise.all([
        getGoal(goalId),
        getProgressHistory(goalId, 7),
      ]);
      setGoal(goalData);
      setProgressHistory(history);
    } catch (error) {
      console.error("Error loading goal:", error);
      Alert.alert("Error", "Failed to load goal data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGoalData();
  };

  const handleLogProgress = async () => {
    if (!totalProgress) {
      Alert.alert("Error", "Please enter total progress percentage");
      return;
    }

    setLogging(true);
    try {
      await logProgress({
        goalId,
        todayProgress: parseInt(todayProgress) || 0,
        totalProgress: parseInt(totalProgress),
      });
      Alert.alert("Success", "Progress logged!");
      setTodayProgress("");
      loadGoalData();
    } catch (error) {
      console.error("Error logging progress:", error);
      Alert.alert("Error", "Failed to log progress");
    } finally {
      setLogging(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!goal) return null;

  const days = daysLeft(goal.targetDate);
  const latestProgress = progressHistory[0]?.totalProgress || 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="flag" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.date}>Target: {formatDate(goal.targetDate)}</Text>

        <View style={styles.progressCircle}>
          <ProgressChart
            data={{ data: [latestProgress / 100] }}
            width={200}
            height={200}
            strokeWidth={16}
            radius={80}
            chartConfig={{
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
            }}
            hideLegend={true}
          />
          <View style={styles.progressText}>
            <Text style={styles.progressValue}>{latestProgress}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{days}</Text>
            <Text style={styles.statLabel}>Days Left</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{goal.priority}</Text>
            <Text style={styles.statLabel}>Priority</Text>
          </View>
        </View>
      </Card>

      {goal.motivationReason && (
        <Card>
          <Text style={styles.sectionTitle}>Why This Matters 💭</Text>
          <Text style={styles.motivation}>{goal.motivationReason}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Log Today's Progress</Text>
        <Text style={styles.label}>Today's Progress (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          value={todayProgress}
          onChangeText={setTodayProgress}
          keyboardType="numeric"
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Total Progress (%) *</Text>
        <TextInput
          style={styles.input}
          placeholder="25"
          value={totalProgress}
          onChangeText={setTotalProgress}
          keyboardType="numeric"
          placeholderTextColor={COLORS.grey}
        />

        <Button
          title="Log Progress"
          onPress={handleLogProgress}
          loading={logging}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Progress</Text>
        {progressHistory.slice(0, 5).map((entry) => (
          <View key={entry.id} style={styles.progressItem}>
            <View style={styles.progressDate}>
              <Text style={styles.progressDateText}>
                {formatDate(entry.date)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${entry.totalProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{entry.totalProgress}%</Text>
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
  header: {
    margin: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  progressCircle: {
    position: "relative",
    marginVertical: 16,
  },
  progressText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  progressValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
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
  motivation: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
    fontStyle: "italic",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressDate: {
    width: 80,
  },
  progressDateText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    width: 40,
    textAlign: "right",
  },
});

export default GoalDetailScreen;
