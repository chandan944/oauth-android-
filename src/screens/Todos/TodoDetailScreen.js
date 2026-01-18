// src/screens/Todos/TodoDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getTodo, toggleTodoComplete, deleteTodo } from "../../services/todoService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, formatEntryDate } from "../../utils/helpers";

const TodoDetailScreen = ({ route, navigation }) => {
  const { todoId } = route.params;
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodo();
  }, []);

  const loadTodo = async () => {
    try {
      const data = await getTodo(todoId);
      setTodo(data);
    } catch (error) {
      console.error("Error loading todo:", error);
      Alert.alert("Error", "Failed to load todo");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    try {
      await toggleTodoComplete(todoId);
      loadTodo();
    } catch (error) {
      console.error("Error toggling todo:", error);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Todo",
      "Are you sure you want to delete this todo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTodo(todoId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting todo:", error);
              Alert.alert("Error", "Failed to delete todo");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("EditTodo", { todoId, todo });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT": return COLORS.error;
      case "HIGH": return COLORS.warning;
      case "MEDIUM": return COLORS.info;
      case "LOW": return COLORS.success;
      default: return COLORS.grey;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "WORK": return "briefcase";
      case "PERSONAL": return "person";
      case "HEALTH": return "fitness";
      case "LEARNING": return "book";
      case "SHOPPING": return "cart";
      default: return "list";
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!todo) return null;

  const priorityColor = getPriorityColor(todo.priority);
  const categoryIcon = getCategoryIcon(todo.category);
  const isOverdue = todo.isOverdue && !todo.completed;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleToggleComplete}
              style={styles.checkbox}
            >
              <Ionicons
                name={todo.completed ? "checkmark-circle" : "ellipse-outline"}
                size={40}
                color={todo.completed ? COLORS.success : COLORS.grey}
              />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text
                style={[
                  styles.title,
                  todo.completed && styles.completedText,
                ]}
              >
                {todo.title}
              </Text>
            </View>
          </View>

          {/* Status Badges */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColor + "20" },
              ]}
            >
              <Text style={[styles.badgeText, { color: priorityColor }]}>
                {todo.priority}
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Ionicons name={categoryIcon} size={16} color={COLORS.primary} />
              <Text style={styles.categoryText}>{todo.category}</Text>
            </View>

            {todo.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}

            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Ionicons name="alert" size={16} color={COLORS.white} />
                <Text style={styles.overdueBadgeText}>Overdue</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Description */}
        {todo.description && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{todo.description}</Text>
          </Card>
        )}

        {/* Details */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>

          {todo.dueDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={18} color={isOverdue ? COLORS.error : COLORS.grey} />
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
                {formatEntryDate(todo.dueDate)}
              </Text>
            </View>
          )}

          {todo.estimatedMinutes && (
            <View style={styles.detailRow}>
              <Ionicons name="timer" size={18} color={COLORS.grey} />
              <Text style={styles.detailLabel}>Estimated Time:</Text>
              <Text style={styles.detailValue}>{todo.estimatedMinutes} min</Text>
            </View>
          )}

          {todo.actualMinutes && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={18} color={COLORS.grey} />
              <Text style={styles.detailLabel}>Actual Time:</Text>
              <Text style={styles.detailValue}>{todo.actualMinutes} min</Text>
            </View>
          )}

          {todo.tags && (
            <View style={styles.detailRow}>
              <Ionicons name="pricetag" size={18} color={COLORS.grey} />
              <Text style={styles.detailLabel}>Tags:</Text>
              <Text style={styles.detailValue}>{todo.tags}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.grey} />
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>{formatDate(todo.createdAt)}</Text>
          </View>

          {todo.completedAt && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-done-circle" size={18} color={COLORS.success} />
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={[styles.detailValue, { color: COLORS.success }]}>
                {formatDate(todo.completedAt)}
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={todo.completed ? "Mark Incomplete" : "Mark Complete"}
            onPress={handleToggleComplete}
            icon={todo.completed ? "close-circle" : "checkmark-circle"}
            variant={todo.completed ? "secondary" : "primary"}
            style={styles.actionButton}
          />
          <Button
            title="Edit"
            onPress={handleEdit}
            icon="create"
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            icon="trash"
            variant="danger"
             style={[styles.actionButton, { backgroundColor: "red" }]}
          />
        </View>
      </ScrollView>
    </View>
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
  headerCard: {
    padding: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    lineHeight: 32,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.success,
    borderRadius: 16,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: 16,
    gap: 4,
  },
  overdueBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
    marginLeft: 4,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "right",
    fontWeight: "600",
  },
  overdueText: {
    color: COLORS.error,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    width: "100%",
  },
});

export default TodoDetailScreen;