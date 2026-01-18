import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";
import {
  getHabit,
  logHabit,
  getHabitLogs,
  deleteHabit,
} from "../../services/habitService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate } from "../../utils/helpers";

const { width } = Dimensions.get("window");

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    loadHabitData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleEditHabit}
            style={styles.headerButton}
          >
            <Ionicons name="eyedrop" size={22} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteHabit}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);
console.log(logs)
  const loadHabitData = async () => {
    try {
      const [habitData, logsData] = await Promise.all([
        getHabit(habitId),
        getHabitLogs(habitId, 7),
      ]);
      setHabit(habitData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error loading habit:", error);
      Alert.alert("Error", "Failed to load habit data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHabitData();
  };

  const handleLogHabit = async (status) => {
    setLogging(true);
    try {
      const currentStreak =
        status === "completed" ? (habit.bestStreak || 0) + 1 : 0;
      await logHabit({
        habitId,
        status,
        currentStreak,
      });
      Alert.alert("Success", "Habit logged!");
      loadHabitData();
    } catch (error) {
      console.error("Error logging habit:", error);
      Alert.alert("Error", "Failed to log habit");
    } finally {
      setLogging(false);
    }
  };

  const handleEditHabit = () => {
    navigation.navigate("EditHabit", { habitId });
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              Alert.alert("Success", "Habit deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting habit:", error);
              Alert.alert("Error", "Failed to delete habit");
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!habit) return null;

  const completionRate = logs.length > 0
    ? Math.round((logs.filter(l => l.status === "completed").length / logs.length) * 100)
    : 0;

  // Prepare chart data with proper date formatting
  const getShortDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month.slice(0, 3)}`;
  };

  const chartData = {
    labels: logs
      .slice(0, 7)
      .reverse()
      .map((log) => getShortDate(log.date)),
    datasets: [
      {
        data: logs.length > 0 
          ? logs
              .slice(0, 7)
              .reverse()
              .map((log) => (log.status === "completed" ? 1 : 0))
          : [0], // Fallback to prevent chart errors
        strokeWidth: 3,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGradient}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{habit.title}</Text>
          <Text style={styles.heroSubtitle}>Target: {habit.targetValue}</Text>
          
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{habit.bestStreak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak 🔥</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="calendar" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{logs.length}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="flame" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>{habit.bestStreak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <Card style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Log Today's Progress</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleLogHabit("completed")}
            disabled={logging}
          >
            <View style={styles.buttonIconBg}>
              <Ionicons name="checkmark" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.buttonText}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleLogHabit("skipped")}
            disabled={logging}
          >
            <View style={styles.buttonIconBg}>
              <Ionicons name="close" size={24} color="#9E9E9E" />
            </View>
            <Text style={styles.buttonText}>Skipped</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Progress Chart */}
      {logs.length > 1 && (
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>7-Day Progress</Text>
          <Text style={styles.chartSubtitle}>
            Track your consistency over the past week
          </Text>
          <LineChart
            data={chartData}
            width={width - 64}
            height={200}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#f5f5f5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#6C5CE7",
                fill: "#fff"
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
          />
        </Card>
      )}

      {/* Recent Logs */}
      <Card style={styles.logsCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {logs.slice(0, 5).map((log, index) => (
          <View key={log.id} style={[
            styles.logItem,
            index === logs.slice(0, 5).length - 1 && styles.logItemLast
          ]}>
            <View style={styles.logLeft}>
              <View style={[
                styles.logDot,
                log.status === "completed" ? styles.logDotSuccess : styles.logDotGrey
              ]} />
              <View>
                <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                <Text style={styles.logTime}>
                  {log.status === "completed" ? "Completed" : "Skipped"}
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusChip,
              log.status === "completed" ? styles.statusChipSuccess : styles.statusChipGrey
            ]}>
              <Ionicons
                name={log.status === "completed" ? "checkmark-circle" : "close-circle"}
                size={16}
                color="#fff"
              />
            </View>
          </View>
        ))}
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
  heroCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroGradient: {
    backgroundColor: "#6C5CE7",
    padding: 32,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },
  streakBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  streakLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
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
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "center",
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  completeButton: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  buttonIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3436",
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
  },
  chartSubtitle: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 16,
    marginTop: -8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  logsCard: {
    margin: 16,
    marginTop: 0,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  logItemLast: {
    borderBottomWidth: 0,
  },
  logLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  logDotSuccess: {
    backgroundColor: "#4CAF50",
  },
  logDotGrey: {
    backgroundColor: "#9E9E9E",
  },
  logDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
  },
  logTime: {
    fontSize: 13,
    color: "#636E72",
    marginTop: 2,
  },
  statusChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusChipSuccess: {
    backgroundColor: "#4CAF50",
  },
  statusChipGrey: {
    backgroundColor: "#9E9E9E",
  },
});

export default HabitDetailScreen;