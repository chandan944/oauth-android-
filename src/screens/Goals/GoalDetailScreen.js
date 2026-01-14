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
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Circle } from "react-native-svg";
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

const { width } = Dimensions.get("window");

const CircularProgress = ({ percentage, size = 200 }) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circularContainer}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6C5CE7"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularText}>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.percentageLabel}>Complete</Text>
      </View>
    </View>
  );
};

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
            <Ionicons name="eyedrop" size={22} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteGoal}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const loadGoalData = async () => {
    try {
      const [goalData, history] = await Promise.all([
        getGoal(goalId),
        getProgressHistory(goalId, 30), // Get more history
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
    if (!progressHistory || progressHistory.length === 0) {
      return 0;
    }
    
    // Sort by date to get the most recent entry
    const sortedHistory = [...progressHistory].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || a.logDate);
      const dateB = new Date(b.date || b.createdAt || b.logDate);
      return dateB - dateA; // Most recent first
    });
    
    return sortedHistory[0]?.totalProgress || 0;
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
      await loadGoalData();
    } catch (error) {
      console.error("Error logging progress:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to log progress. Please try again."
      );
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

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return '#FF5252';
      case 'medium': return '#FFA726';
      case 'low': return '#66BB6A';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>{goal.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}>
              {goal.priority} Priority
            </Text>
          </View>
        </View>
        <Text style={styles.heroDate}>Target: {formatDate(goal.targetDate)}</Text>
      </View>

      {/* Progress Circle */}
      <Card style={styles.progressCard}>
        <CircularProgress percentage={latestProgress} size={220} />
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{days}</Text>
          <Text style={styles.statLabel}>Days Left</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{100 - latestProgress}%</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="stats-chart" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.statValue}>{progressHistory.length}</Text>
          <Text style={styles.statLabel}>Updates</Text>
        </View>
      </View>

      {/* Motivation */}
      {goal.motivationReason && (
        <Card style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Ionicons name="heart" size={24} color="#FF5252" />
            <Text style={styles.motivationTitle}>Why This Matters</Text>
          </View>
          <Text style={styles.motivationText}>{goal.motivationReason}</Text>
        </Card>
      )}

      {/* Log Progress */}
      <Card style={styles.logCard}>
   
        
        <View style={styles.currentProgressBox}>
          <Text style={styles.currentLabel}>Current Progress</Text>
          <Text style={styles.currentValue}>{latestProgress}%</Text>
        </View>

        <Text style={styles.inputLabel}>Add Today's Progress (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 5"
          value={todayProgress}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, "");
            setTodayProgress(numericValue);
          }}
          keyboardType="numeric"
          placeholderTextColor="#B0B0B0"
        />

        {todayProgress && parseInt(todayProgress) > 0 && (
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={styles.previewNumber}>{latestProgress}%</Text>
                <Text style={styles.previewLabel}>Current</Text>
              </View>
              <Ionicons name="add" size={24} color="#6C5CE7" />
              <View style={styles.previewItem}>
                <Text style={styles.previewNumber}>{todayProgress}%</Text>
                <Text style={styles.previewLabel}>Today</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#6C5CE7" />
              <View style={styles.previewItem}>
                <Text style={[styles.previewNumber, styles.previewResult]}>
                  {previewNewTotal}%
                </Text>
                <Text style={styles.previewLabel}>New Total</Text>
              </View>
            </View>
          </View>
        )}

        <Button
          title="Log Progress"
          onPress={handleLogProgress}
          loading={logging}
        />
      </Card>

      {/* Progress History */}
      <Card style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Progress Timeline</Text>
        {progressHistory && progressHistory.length > 0 ? (
          (() => {
            // Sort history by date (most recent first) for display
            const sortedHistory = [...progressHistory].sort((a, b) => {
              const dateA = new Date(a.date || a.createdAt || a.logDate);
              const dateB = new Date(b.date || b.createdAt || b.logDate);
              return dateB - dateA;
            });

            return sortedHistory.slice(0, 5).map((entry, index) => (
              <View key={entry.id || index} style={[
                styles.historyItem,
                index === Math.min(4, sortedHistory.slice(0, 5).length - 1) && styles.historyItemLast
              ]}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyDot} />
                  {index !== Math.min(4, sortedHistory.slice(0, 5).length - 1) && (
                    <View style={styles.historyLine} />
                  )}
                </View>
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {formatDate(entry.date || entry.createdAt || entry.logDate || new Date())}
                    </Text>
                    <View style={styles.historyBadge}>
                      <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                      <Text style={styles.historyBadgeText}>+{entry.todayProgress || 0}%</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[styles.progressBarFill, { width: `${entry.totalProgress || 0}%` }]}
                      />
                    </View>
                    <Text style={styles.progressBarText}>{entry.totalProgress || 0}%</Text>
                  </View>
                </View>
              </View>
            ));
          })()
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No progress logged yet</Text>
          </View>
        )}
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
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  heroSection: {
    backgroundColor: "#6C5CE7",
    padding: 24,
    paddingTop: 16,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  progressCard: {
    margin: 16,
    marginTop: -40,
    alignItems: "center",
    padding: 24,
    elevation: 8,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  circularContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circularText: {
    position: "absolute",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  percentageLabel: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
  motivationCard: {
    margin: 16,
    marginTop: 0,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
  },
  motivationText: {
    fontSize: 14,
    color: "#636E72",
    lineHeight: 22,
  },
  logCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 16,
  },
  currentProgressBox: {
    backgroundColor: "#F0EEFF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  previewCard: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  previewItem: {
    alignItems: "center",
  },
  previewNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 4,
  },
  previewResult: {
    color: "#4CAF50",
  },
  previewLabel: {
    fontSize: 11,
    color: "#636E72",
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
  },
  historyItem: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  historyItemLast: {
    paddingBottom: 0,
  },
  historyLeft: {
    width: 32,
    alignItems: "center",
    position: "relative",
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6C5CE7",
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 1,
  },
  historyLine: {
    position: "absolute",
    top: 12,
    width: 2,
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  historyContent: {
    flex: 1,
    marginLeft: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6C5CE7",
    width: 45,
    textAlign: "right",
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
});

export default GoalDetailScreen;