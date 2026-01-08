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
  const [daysToComplete, setDaysToComplete] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [motivationReason, setMotivationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];

  // Quick day presets
  const quickPresets = [
    { label: '7 Days', days: 7 },
    { label: '14 Days', days: 14 },
    { label: '30 Days', days: 30 },
    { label: '60 Days', days: 60 },
    { label: '90 Days', days: 90 },
    { label: '180 Days', days: 180 },
  ];

  // Format date as YYYY-MM-DD for backend
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate target date from days
  const calculateTargetDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date;
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleQuickPreset = (days) => {
    setDaysToComplete(days.toString());
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!daysToComplete || parseInt(daysToComplete) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days (greater than 0)');
      return;
    }

    const days = parseInt(daysToComplete);
    if (days > 365) {
      Alert.alert('Error', 'Maximum 365 days allowed');
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date();
      const targetDate = calculateTargetDate(days);

      const startDateFormatted = formatDate(startDate);
      const targetDateFormatted = formatDate(targetDate);

      console.log('📅 Creating goal with dates:', {
        startDate: startDateFormatted,
        targetDate: targetDateFormatted,
        days: days
      });

      await createGoal({
        title: title.trim(),
        startDate: startDateFormatted,
        targetDate: targetDateFormatted,
        priority,
        status: 'in_progress',
        motivationReason: motivationReason.trim() || null,
      });

      Alert.alert('Success', `Goal created! Target: ${formatDisplayDate(targetDate)}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating goal:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create goal. Please try again.'
      );
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

        <Text style={styles.label}>Days to Complete *</Text>
        
        {/* Quick Presets */}
        <View style={styles.presetsContainer}>
          {quickPresets.map((preset) => (
            <TouchableOpacity
              key={preset.days}
              style={[
                styles.presetButton,
                daysToComplete === preset.days.toString() && styles.presetButtonActive
              ]}
              onPress={() => handleQuickPreset(preset.days)}
            >
              <Text style={[
                styles.presetText,
                daysToComplete === preset.days.toString() && styles.presetTextActive
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.daysInputContainer}>
          <TextInput
            style={styles.daysInput}
            placeholder="Enter number of days"
            value={daysToComplete}
            onChangeText={(text) => {
              // Only allow numbers
              const numericValue = text.replace(/[^0-9]/g, '');
              setDaysToComplete(numericValue);
            }}
            keyboardType="numeric"
            placeholderTextColor={COLORS.grey}
          />
          <Text style={styles.daysLabel}>days</Text>
        </View>

        {/* Show calculated target date if days entered */}
        {daysToComplete && parseInt(daysToComplete) > 0 && (
          <View style={styles.targetDatePreview}>
            <Text style={styles.targetDateLabel}>Target Date:</Text>
            <Text style={styles.targetDateValue}>
              📅 {formatDisplayDate(calculateTargetDate(parseInt(daysToComplete)))}
            </Text>
          </View>
        )}

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
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  daysInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  daysInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    padding: 16,
    textAlign: 'center',
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    paddingRight: 8,
  },
  targetDatePreview: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  targetDateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  targetDateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
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