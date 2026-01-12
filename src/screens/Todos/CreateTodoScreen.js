// src/screens/Todos/CreateTodoScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createTodo } from "../../services/todoService";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { COLORS } from "../../utils/colors";

const CreateTodoScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("PERSONAL");
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const priorities = [
    { value: "LOW", label: "Low", color: COLORS.success, icon: "arrow-down" },
    { value: "MEDIUM", label: "Medium", color: COLORS.info, icon: "remove" },
    { value: "HIGH", label: "High", color: COLORS.warning, icon: "arrow-up" },
    { value: "URGENT", label: "Urgent", color: COLORS.error, icon: "flash" },
  ];

  const categories = [
    { value: "PERSONAL", label: "Personal", icon: "person" },
    { value: "WORK", label: "Work", icon: "briefcase" },
    { value: "HEALTH", label: "Health", icon: "fitness" },
    { value: "LEARNING", label: "Learning", icon: "book" },
    { value: "SHOPPING", label: "Shopping", icon: "cart" },
    { value: "OTHER", label: "Other", icon: "ellipsis-horizontal" },
  ];

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setLoading(true);
    try {
      const todoData = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        category,
        dueDate: dueDate ? dueDate.toISOString().split("T")[0] : null,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        tags: tags.trim() || null,
      };

      await createTodo(todoData);
      Alert.alert("Success", "Todo created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating todo:", error);
      Alert.alert("Error", "Failed to create todo");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Title </Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            placeholderTextColor={COLORS.grey}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
            placeholderTextColor={COLORS.grey}
          />

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsGrid}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.optionButton,
                  priority === p.value && {
                    backgroundColor: p.color + "20",
                    borderColor: p.color,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Ionicons
                  name={p.icon}
                  size={20}
                  color={priority === p.value ? p.color : COLORS.grey}
                />
                <Text
                  style={[
                    styles.optionText,
                    priority === p.value && {
                      color: p.color,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[
                  styles.optionButton,
                  category === c.value && styles.optionButtonActive,
                ]}
                onPress={() => setCategory(c.value)}
              >
                <Ionicons
                  name={c.icon}
                  size={20}
                  color={category === c.value ? COLORS.primary : COLORS.grey}
                />
                <Text
                  style={[
                    styles.optionText,
                    category === c.value && styles.optionTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Due Date */}
          <Text style={styles.label}>Due Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.dateButtonText}>
              {dueDate ? dueDate.toLocaleDateString() : "Set due date"}
            </Text>
            {dueDate && (
              <TouchableOpacity onPress={() => setDueDate(null)}>
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          {/* Estimated Time */}
          <Text style={styles.label}>Estimated Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30"
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="numeric"
            placeholderTextColor={COLORS.grey}
          />

          {/* Tags */}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={[styles.button, { backgroundColor: "orange" }]}
            />

            <Button
              title="Create Todo"
              onPress={handleCreate}
              loading={loading}
              style={[styles.button, { backgroundColor: "green" }]}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 6,
    minWidth: "48%",
  },
  optionButtonActive: {
    backgroundColor: COLORS.primaryLight + "20",
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default CreateTodoScreen;
