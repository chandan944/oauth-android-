// src/screens/Todos/TodoAnalyticsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { getTodoStats } from "../../services/todoService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";

const screenWidth = Dimensions.get("window").width;

const TodoAnalyticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getTodoStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
      Alert.alert("Error", "Failed to load statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  // Prepare Category Pie Chart Data
  const categoryData = [
    {
      name: "Personal",
      count: stats.categoryStats.personal,
      color: "#FF6B9D",
      legendFontColor: COLORS.text,
    },
    {
      name: "Work",
      count: stats.categoryStats.work,
      color: "#4A90E2",
      legendFontColor: COLORS.text,
    },
    {
      name: "Health",
      count: stats.categoryStats.health,
      color: "#50C878",
      legendFontColor: COLORS.text,
    },
    {
      name: "Learning",
      count: stats.categoryStats.learning,
      color: "#FFA500",
      legendFontColor: COLORS.text,
    },
    {
      name: "Shopping",
      count: stats.categoryStats.shopping,
      color: "#9B59B6",
      legendFontColor: COLORS.text,
    },
    {
      name: "Other",
      count: stats.categoryStats.other,
      color: "#95A5A6",
      legendFontColor: COLORS.text,
    },
  ].filter((item) => item.count > 0);

  // Prepare Priority Bar Chart Data
  const priorityData = {
    labels: ["Low", "Medium", "High", "Urgent"],
    datasets: [
      {
        data: [
          stats.priorityStats.low || 0,
          stats.priorityStats.medium || 0,
          stats.priorityStats.high || 0,
          stats.priorityStats.urgent || 0,
        ],
      },
    ],
  };

  // Prepare Productivity Line Chart Data
  const productivityData = {
    labels: stats.productivityStats.last7Days.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }),
    datasets: [
      {
        data: stats.productivityStats.last7Days.map((d) => d.completed),
        color: () => COLORS.success,
        strokeWidth: 3,
      },
      {
        data: stats.productivityStats.last7Days.map((d) => d.created),
        color: () => COLORS.primary,
        strokeWidth: 3,
      },
    ],
    legend: ["Completed", "Created"],
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const StatCard = ({ icon, label, value, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overview Stats */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="list"
            label="Total"
            value={stats.totalTodos}
            color={COLORS.primary}
          />
          <StatCard
            icon="checkmark-circle"
            label="Completed"
            value={stats.completedTodos}
            color={COLORS.success}
          />
          <StatCard
            icon="time"
            label="Pending"
            value={stats.pendingTodos}
            color={COLORS.warning}
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={stats.overdueTodos}
            color={COLORS.error}
          />
        </View>

        {/* Completion Rate */}
        <View style={styles.completionRateContainer}>
          <View style={styles.completionRateHeader}>
            <Text style={styles.completionRateLabel}>Completion Rate</Text>
            <Text style={styles.completionRateValue}>
              {stats.completionRate}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${stats.completionRate}%` },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Productivity Stats */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Productivity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="today"
            label="Today"
            value={stats.productivityStats.completedToday}
            color="#FF6B9D"
            subtitle="completed"
          />
          <StatCard
            icon="calendar"
            label="This Week"
            value={stats.productivityStats.completedThisWeek}
            color="#4A90E2"
            subtitle="completed"
          />
          <StatCard
            icon="calendar-outline"
            label="This Month"
            value={stats.productivityStats.completedThisMonth}
            color="#50C878"
            subtitle="completed"
          />
          <StatCard
            icon="timer"
            label="Avg Time"
            value={stats.productivityStats.avgCompletionTime}
            color="#FFA500"
            subtitle="minutes"
          />
        </View>
      </Card>

      {/* 7-Day Productivity Chart */}
      {stats.productivityStats.last7Days.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📈 7-Day Productivity</Text>
          <LineChart
            data={productivityData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withDots={true}
            withShadow={false}
          />
        </Card>
      )}

      {/* Priority Distribution */}
      {(stats.priorityStats.low + stats.priorityStats.medium + 
        stats.priorityStats.high + stats.priorityStats.urgent) > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Priority Distribution (Pending)</Text>
          <BarChart
            data={priorityData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => {
                return `rgba(255, 107, 157, ${opacity})`;
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
          <View style={styles.priorityLegend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>
                Low: {stats.priorityStats.low}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.legendText}>
                Medium: {stats.priorityStats.medium}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>
                High: {stats.priorityStats.high}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.legendText}>
                Urgent: {stats.priorityStats.urgent}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Category Distribution</Text>
          <PieChart
            data={categoryData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        </Card>
      )}

      {/* Upcoming Deadlines */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Upcoming Deadlines</Text>
        <View style={styles.deadlinesGrid}>
          <View style={styles.deadlineCard}>
            <Ionicons name="today" size={24} color={COLORS.error} />
            <Text style={styles.deadlineValue}>{stats.todayTodos}</Text>
            <Text style={styles.deadlineLabel}>Due Today</Text>
          </View>
          <View style={styles.deadlineCard}>
            <Ionicons name="calendar" size={24} color={COLORS.warning} />
            <Text style={styles.deadlineValue}>{stats.weekTodos}</Text>
            <Text style={styles.deadlineLabel}>This Week</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.grey,
    marginTop: 2,
  },
  completionRateContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  completionRateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  completionRateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  completionRateValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  priorityLegend: {
    marginTop: 16,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  deadlinesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  deadlineCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  deadlineValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  deadlineLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default TodoAnalyticsScreen;