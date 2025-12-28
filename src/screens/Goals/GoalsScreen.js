import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getMyGoals } from "../../services/goalService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { daysLeft, formatDate } from "../../utils/helpers";

const GoalsScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getMyGoals();
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const renderGoal = ({ item }) => {
    const days = daysLeft(item.targetDate);

    return (
      <Card
        onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })}
      >
        <View style={styles.goalHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="flag" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalDate}>
              Target: {formatDate(item.targetDate)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View
            style={[styles.priorityBadge, styles[`${item.priority}Priority`]]}
          >
            <Text style={styles.priorityText}>{item.priority} Priority</Text>
          </View>
          <View style={styles.daysLeft}>
            <Ionicons name="time-outline" size={16} color={COLORS.grey} />
            <Text style={styles.daysText}>
              {days > 0 ? `${days} days left` : "Overdue"}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateGoal")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>New Goal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="flag-outline"
            title="No Goals Yet"
            message="Set your first goal and start achieving!"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  list: {
    padding: 16,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  goalDate: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  HighPriority: {
    backgroundColor: COLORS.error + "20",
  },
  MediumPriority: {
    backgroundColor: COLORS.warning + "20",
  },
  LowPriority: {
    backgroundColor: COLORS.success + "20",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  daysLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  daysText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.grey,
  },
});

export default GoalsScreen;
