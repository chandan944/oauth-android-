// src/screens/Goals/CreateGoalScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { createGoal } from '../../services/goalService';
import Button from '../../components/common/Button';
import { COLORS } from '../../utils/colors';

const CreateGoalScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [motivationReason, setMotivationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];

  const handleCreate = async () => {
    if (!title || !targetDate) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      await createGoal({
        title,
        startDate: new Date().toISOString().split('T')[0],
        targetDate,
        priority,
        status: 'in_progress',
        motivationReason,
      });
      Alert.alert('Success', 'Goal created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.subtitle}>Set a new goal to achieve</Text>

        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Learn React Native"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Target Date * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-12-31"
          value={targetDate}
          onChangeText={setTargetDate}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton,
                priority === p && styles.priorityButtonActive,
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === p && styles.priorityTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Why is this important? (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What motivates you to achieve this?"
          value={motivationReason}
          onChangeText={setMotivationReason}
          multiline
          numberOfLines={4}
          placeholderTextColor={COLORS.grey}
        />

        <Button title="Create Goal" onPress={handleCreate} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 16,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  priorityTextActive: {
    color: COLORS.primary,
  },
});

export default CreateGoalScreen;