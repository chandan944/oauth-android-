import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getMyGoals, deleteGoal } from "../../services/goalService";
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

  const handleDeleteGoal = (goalId, goalTitle) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goalTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              Alert.alert("Success", "Goal deleted successfully");
              loadGoals();
            } catch (error) {
              console.error("Error deleting goal:", error);
              Alert.alert("Error", "Failed to delete goal");
            }
          },
        },
      ]
    );
  };

  const handleEditGoal = (goalId) => {
    navigation.navigate("EditGoal", { goalId });
  };

  const renderGoal = ({ item }) => {
    const days = daysLeft(item.targetDate);

    return (
      <Card
        onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })}
      >
        <View style={styles.goalHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="golf" size={32} color={COLORS.black} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalDate}>
              Target: {formatDate(item.targetDate)}
            </Text>
          </View>

          {/* Admin Action Buttons */}
          
            <View style={styles.adminActions}>
              <TouchableOpacity
                onPress={() => handleEditGoal(item.id)}
                style={styles.actionButton}
              >
                <Ionicons name="eyedrop" size={20} color={COLORS.success} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteGoal(item.id, item.title)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
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
          {/* <Text style={styles.addButtonText}>New Goal</Text> */}
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
    // alignItems: "center",
    // justifyContent: "center",
    width:"16%",
    backgroundColor: "#010501",
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
  adminActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
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