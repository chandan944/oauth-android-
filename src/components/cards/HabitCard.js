import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "../common/Card";
import { COLORS } from "../../utils/colors";

const HabitCard = ({ habit, todayLog, onPress, onLogPress }) => {
  const isCompleted = todayLog?.status === "completed";

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.habitInfo}>
          <View
            style={[
              styles.iconContainer,
              isCompleted ? styles.completedIcon : styles.pendingIcon,
            ]}
          >
            <Ionicons
              name={
                isCompleted ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={32}
              color={isCompleted ? COLORS.success : COLORS.grey}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{habit.title}</Text>
            <Text style={styles.target}>Target: {habit.targetValue}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{habit.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak 🔥</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayLog?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
      </View>

      {onLogPress && !isCompleted && (
        <TouchableOpacity style={styles.logButton} onPress={onLogPress}>
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.logButtonText}>Log Today</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
          <Text style={styles.completedText}>Completed Today!</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  habitInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  completedIcon: {
    backgroundColor: COLORS.success + "20",
  },
  pendingIcon: {
    backgroundColor: COLORS.grey + "20",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  target: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
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
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 12,
  },
  completedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default HabitCard;
