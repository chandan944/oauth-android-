import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
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
import { Dimensions } from "react-native";

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
              <Ionicons name="eyedrop" size={24} color={COLORS.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteHabit}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ),
      });
    
  }, [navigation]);

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

  // Prepare chart data
  const chartData = {
    labels: logs
      .slice(0, 7)
      .reverse()
      .map((log) => formatDate(log.date).slice(0, 5)),
    datasets: [
      {
        data: logs
          .slice(0, 7)
          .reverse()
          .map((log) => (log.status === "completed" ? 1 : 0)),
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
      <Card style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="balloon-sharp" size={48} color={COLORS.error} />
        </View>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.target}>Target: {habit.targetValue}</Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{habit.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak 🔥</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Log Today's Progress</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.logButton, styles.completeButton]}
            onPress={() => handleLogHabit("completed")}
            disabled={logging}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            <Text style={styles.logButtonText}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logButton, styles.skipButton]}
            onPress={() => handleLogHabit("skipped")}
            disabled={logging}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.white} />
            <Text style={styles.logButtonText}>Skipped</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {logs.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Progress Chart (Last 7 Days)</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.primaryLight + "20",
              backgroundGradientTo: COLORS.primary + "20",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Recent Logs</Text>
        {logs.slice(0, 5).map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logDate}>
              <Text style={styles.logDateText}>{formatDate(log.date)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                log.status === "completed"
                  ? styles.completedBadge
                  : styles.skippedBadge,
              ]}
            >
              <Ionicons
                name={log.status === "completed" ? "checkmark" : "close"}
                size={16}
                color={COLORS.white}
              />
              <Text style={styles.statusText}>{log.status}</Text>
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
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  header: {
    margin: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  target: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 16,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  skipButton: {
    backgroundColor: COLORS.grey,
  },
  logButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logDate: {
    flex: 1,
  },
  logDateText: {
    fontSize: 14,
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
  },
  skippedBadge: {
    backgroundColor: COLORS.grey,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default HabitDetailScreen;