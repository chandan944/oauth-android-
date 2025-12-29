import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { createGoal } from '../../services/goalService';
import Button from '../../components/common/Button';
import { COLORS } from '../../utils/colors';

const CreateGoalScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [motivationReason, setMotivationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];

  // Generate date options (next 365 days)
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 1; i <= 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date);
    }
    
    return options;
  };

  const dateOptions = generateDateOptions();

  // Format date as YYYY-MM-DD for backend
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get relative date string (Tomorrow, In 7 days, etc.)
  const getRelativeDateString = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDateCopy = new Date(date);
    targetDateCopy.setHours(0, 0, 0, 0);
    
    const diffTime = targetDateCopy - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 7) return 'In 1 week';
    if (diffDays === 14) return 'In 2 weeks';
    if (diffDays === 30) return 'In 1 month';
    if (diffDays === 90) return 'In 3 months';
    if (diffDays === 180) return 'In 6 months';
    if (diffDays === 365) return 'In 1 year';
    
    return `In ${diffDays} days`;
  };

  const handleDateSelect = (date) => {
    setTargetDate(date);
    setShowDatePicker(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    // Validate target date is in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      Alert.alert('Error', 'Target date must be in the future');
      return;
    }

    setLoading(true);
    try {
      const startDateFormatted = formatDate(new Date());
      const targetDateFormatted = formatDate(targetDate);

      console.log('📅 Creating goal with dates:', {
        startDate: startDateFormatted,
        targetDate: targetDateFormatted
      });

      await createGoal({
        title: title.trim(),
        startDate: startDateFormatted,
        targetDate: targetDateFormatted,
        priority,
        status: 'in_progress',
        motivationReason: motivationReason.trim() || null,
      });

      Alert.alert('Success', 'Goal created successfully!', [
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

  // Quick date presets
  const quickPresets = [
    { label: 'Tomorrow', days: 1 },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
  ];

  const handleQuickPreset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setTargetDate(date);
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

        <Text style={styles.label}>Target Date *</Text>
        
        {/* Quick Presets */}
        <View style={styles.presetsContainer}>
          {quickPresets.map((preset) => (
            <TouchableOpacity
              key={preset.days}
              style={styles.presetButton}
              onPress={() => handleQuickPreset(preset.days)}
            >
              <Text style={styles.presetText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            📅 {formatDisplayDate(targetDate)}
          </Text>
          <Text style={styles.relativeDateText}>
            {getRelativeDateString(targetDate)}
          </Text>
        </TouchableOpacity>

        {/* Custom Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Target Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.dateList}>
                {dateOptions.filter((_, index) => 
                  // Show: Tomorrow, then every 7 days for first 90 days, then every 30 days
                  index === 0 || 
                  (index < 90 && index % 7 === 0) || 
                  (index >= 90 && index % 30 === 0)
                ).map((date, index) => {
                  const isSelected = formatDate(date) === formatDate(targetDate);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateOption,
                        isSelected && styles.dateOptionSelected
                      ]}
                      onPress={() => handleDateSelect(date)}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        isSelected && styles.dateOptionTextSelected
                      ]}>
                        {formatDisplayDate(date)}
                      </Text>
                      <Text style={[
                        styles.dateOptionSubtext,
                        isSelected && styles.dateOptionSubtextSelected
                      ]}>
                        {getRelativeDateString(date)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  datePickerButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  relativeDateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textLight,
    fontWeight: '300',
  },
  dateList: {
    padding: 16,
  },
  dateOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  dateOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dateOptionSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  dateOptionSubtextSelected: {
    color: COLORS.primary,
  },
});

export default CreateGoalScreen;