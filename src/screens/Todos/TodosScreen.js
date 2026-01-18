// src/screens/Todos/TodosScreen.js
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAllTodos, toggleTodoComplete, deleteTodo } from "../../services/todoService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatEntryDate , formatDate } from "../../utils/helpers";

const TodosScreen = ({ navigation }) => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log(todos)
  // Add Analytics button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("TodoAnalytics")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="calendar-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadTodos();
  }, [filter]);

  const loadTodos = async () => {
    try {
      const response = await getAllTodos(0, 50);
      let filteredTodos = response.content || [];
      
      if (filter === "pending") {
        filteredTodos = filteredTodos.filter(t => !t.completed);
      } else if (filter === "completed") {
        filteredTodos = filteredTodos.filter(t => t.completed);
      }
      
      setTodos(filteredTodos);
    } catch (error) {
      console.error("Error loading todos:", error);
      Alert.alert("Error", "Failed to load todos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTodos();
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleTodoComplete(id);
      loadTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const handleDelete = (id) => {
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
              await deleteTodo(id);
              loadTodos();
            } catch (error) {
              console.error("Error deleting todo:", error);
              Alert.alert("Error", "Failed to delete todo");
            }
          },
        },
      ]
    );
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

  const renderTodo = ({ item }) => {
    const priorityColor = getPriorityColor(item.priority);
    const categoryIcon = getCategoryIcon(item.category);
    const isOverdue = item.isOverdue && !item.completed;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("TodoDetail", { todoId: item.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.todoCard}>
          <View style={styles.todoHeader}>
            <TouchableOpacity
              onPress={() => handleToggleComplete(item.id)}
              style={styles.checkbox}
            >
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={28}
                color={item.completed ? COLORS.success : COLORS.grey}
              />
            </TouchableOpacity>

            <View style={styles.todoContent}>
              <Text
                style={[
                  styles.todoTitle,
                  item.completed && styles.completedText,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {item.description && (
                <Text
                  style={[styles.todoDescription, item.completed && styles.completedText]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}

              <View style={styles.todoMeta}>
                <View style={styles.metaRow}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
                    <Text style={[styles.priorityText, { color: priorityColor }]}>
                      {item.priority}
                    </Text>
                  </View>

                  <View style={styles.categoryBadge}>
                    <Ionicons name={categoryIcon} size={14} color={COLORS.primary} />
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>

                  {item.dueDate && (
                    <View style={[styles.dueDateBadge, isOverdue && styles.overdueBadge]}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={isOverdue ? COLORS.error : COLORS.textLight}
                      />
                      <Text
                        style={[
                          styles.dueDateText,
                          isOverdue && styles.overdueText,
                        ]}
                      >
                        {formatEntryDate(item.dueDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterBtnText,
          filter === value && styles.filterBtnTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Pending" value="pending" />
        <FilterButton title="Completed" value="completed" />
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No Todos"
            message={`You don't have any ${filter !== "all" ? filter : ""} todos yet!`}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateTodo")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: COLORS.black,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
  },
  todoCard: {
    marginBottom: 12,
    padding: 12,
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  todoMeta: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight + "15",
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    gap: 4,
  },
  overdueBadge: {
    backgroundColor: COLORS.error + "15",
  },
  dueDateText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  overdueText: {
    color: COLORS.error,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#010501",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default TodosScreen;