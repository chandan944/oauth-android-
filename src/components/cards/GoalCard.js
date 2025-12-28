import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "../common/Card";
import { COLORS } from "../../utils/colors";
import { formatDate, daysLeft, calculateProgress } from "../../utils/helpers";

const GoalCard = ({ goal, todayProgress, onPress }) => {
  const days = daysLeft(goal.targetDate);
  const progress = todayProgress?.totalProgress || 0;

  const priorityColors = {
    High: COLORS.error,
    Medium: COLORS.warning,
    Low: COLORS.success,
  };

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="flag" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.date}>Target: {formatDate(goal.targetDate)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      <View style={styles.footer}>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityColors[goal.priority] + "20" },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              { color: priorityColors[goal.priority] },
            ]}
          >
            {goal.priority} Priority
          </Text>
        </View>

        <View style={styles.daysLeft}>
          <Ionicons name="time-outline" size={16} color={COLORS.grey} />
          <Text style={styles.daysText}>
            {days > 0 ? `${days} days left` : "Overdue"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              goal.status === "completed" ? COLORS.success : COLORS.info,
          },
        ]}
      >
        <Text style={styles.statusText}>{goal.status.replace("_", " ")}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    width: 50,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
    textTransform: "capitalize",
  },
});

export default GoalCard;
