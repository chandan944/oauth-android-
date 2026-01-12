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
import { getMyHabits, deleteHabit } from "../../services/habitService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";

const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await getMyHabits();
      setHabits(data);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHabits();
  };

  const handleDeleteHabit = (habitId, habitTitle) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              Alert.alert("Success", "Habit deleted successfully");
              loadHabits();
            } catch (error) {
              console.error("Error deleting habit:", error);
              Alert.alert("Error", "Failed to delete habit");
            }
          },
        },
      ]
    );
  };

  const handleEditHabit = (habitId) => {
    navigation.navigate("EditHabit", { habitId });
  };

  const renderHabit = ({ item }) => (
    <Card
      onPress={() => navigation.navigate("HabitDetail", { habitId: item.id })}
    >
      <View style={styles.habitHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-done-sharp" size={32} color={COLORS.black} />
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitTitle}>{item.title}</Text>
          <Text style={styles.habitTarget}>Target: {item.targetValue}</Text>
        </View>

        {/* Admin Action Buttons */}
       
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() => handleEditHabit(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="eyedrop" size={20} color={COLORS.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteHabit(item.id, item.title)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
      
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak 🔥</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateHabit")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>New Habit</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="No Habits Yet"
            message="Create your first habit to start tracking!"
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
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  habitTarget: {
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
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
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
});

export default HabitsScreen;