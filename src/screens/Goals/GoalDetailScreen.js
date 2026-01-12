import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ProgressChart } from "react-native-chart-kit";
import {
  getGoal,
  logProgress,
  getProgressHistory,
  deleteGoal,
} from "../../services/goalService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, daysLeft } from "../../utils/helpers";

const GoalDetailScreen = ({ route, navigation }) => {
  const { goalId } = route.params;
  const [goal, setGoal] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayProgress, setTodayProgress] = useState("");
  const [logging, setLogging] = useState(false);

 
  useEffect(() => {
    loadGoalData();
  }, []);

  useEffect(() => {
   
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleEditGoal}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteGoal}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ),
      });
    
  }, [navigation]);

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

  const getCurrentTotalProgress = () => {
    if (progressHistory && progressHistory.length > 0) {
      return progressHistory[0]?.totalProgress || 0;
    }
    return 0;
  };

  const calculateNewTotalProgress = () => {
    const currentTotal = getCurrentTotalProgress();
    const todayAdd = parseInt(todayProgress) || 0;
    const newTotal = currentTotal + todayAdd;
    return Math.min(newTotal, 100);
  };

  const handleLogProgress = async () => {
    if (!todayProgress || parseInt(todayProgress) <= 0) {
      Alert.alert("Error", "Please enter today's progress (must be greater than 0)");
      return;
    }

    const todayProgressNum = parseInt(todayProgress);

    if (todayProgressNum > 100) {
      Alert.alert("Error", "Today's progress cannot exceed 100%");
      return;
    }

    const currentTotal = getCurrentTotalProgress();
    const newTotal = calculateNewTotalProgress();

    if (newTotal > 100) {
      Alert.alert(
        "Warning",
        `Adding ${todayProgressNum}% would exceed 100% (current: ${currentTotal}%). The total will be capped at 100%.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => submitProgress(todayProgressNum, 100),
          },
        ]
      );
      return;
    }

    submitProgress(todayProgressNum, newTotal);
  };

  const submitProgress = async (todayProgressNum, totalProgressNum) => {
    setLogging(true);
    try {
      await logProgress({
        goalId,
        todayProgress: todayProgressNum,
        totalProgress: totalProgressNum,
      });

      Alert.alert(
        "Success! 🎉",
        `Progress logged!\nToday: +${todayProgressNum}%\nTotal: ${totalProgressNum}%`
      );

      setTodayProgress("");
      loadGoalData();
    } catch (error) {
      console.error("Error logging progress:", error);
      Alert.alert("Error", "Failed to log progress");
    } finally {
      setLogging(false);
    }
  };

  const handleEditGoal = () => {
    navigation.navigate("EditGoal", { goalId });
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              Alert.alert("Success", "Goal deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting goal:", error);
              Alert.alert("Error", "Failed to delete goal");
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!goal) return null;

  const days = daysLeft(goal.targetDate);
  const latestProgress = getCurrentTotalProgress();
  const previewNewTotal = todayProgress
    ? calculateNewTotalProgress()
    : latestProgress;

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

        <View style={styles.currentProgressBox}>
          <Text style={styles.currentProgressLabel}>Current Total Progress</Text>
          <Text style={styles.currentProgressValue}>{latestProgress}%</Text>
        </View>

        <Text style={styles.label}>Add Today's Progress (%) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 5"
          value={todayProgress}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, "");
            setTodayProgress(numericValue);
          }}
          keyboardType="numeric"
          placeholderTextColor={COLORS.grey}
        />

        {todayProgress && parseInt(todayProgress) > 0 && (
          <View style={styles.previewBox}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationText}>
                {latestProgress}% (current)
              </Text>
              <Text style={styles.calculationPlus}>+</Text>
              <Text style={styles.calculationText}>
                {todayProgress}% (today)
              </Text>
              <Text style={styles.calculationEquals}>=</Text>
              <Text style={styles.calculationResult}>{previewNewTotal}%</Text>
            </View>
            <Text style={styles.previewLabel}>New Total Progress</Text>
          </View>
        )}

        <Button
          title="Log Progress"
          onPress={handleLogProgress}
          loading={logging}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Progress History</Text>
        {progressHistory && progressHistory.length > 0 ? (
          progressHistory.slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.progressItem}>
              <View style={styles.progressItemHeader}>
                <Text style={styles.progressDateText}>
                  {formatDate(entry.date)}
                </Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    +{entry.todayProgress}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${entry.totalProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {entry.totalProgress}%
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No progress logged yet</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  header: {
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
    textAlign: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  progressCircle: {
    position: "relative",
    alignItems: "center",
    marginVertical: 16,
  },
  progressText: {
    position: "absolute",
    top: "50%",
    left: "39%",
    transform: [{ translateX: -50 }, { translateY: -30 }],
    alignItems: "center",
  },
  progressValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  motivation: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  currentProgressBox: {
    backgroundColor: COLORS.primary + "10",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  currentProgressLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  currentProgressValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewBox: {
    backgroundColor: COLORS.success + "15",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  calculationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  calculationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  calculationPlus: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  calculationEquals: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  calculationResult: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: "bold",
  },
  previewLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  progressItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressDateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  progressBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 14,
    paddingVertical: 16,
  },
});

export default GoalDetailScreen;