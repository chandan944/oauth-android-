import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getGoal, updateGoal } from '../../services/goalService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../utils/colors';

const EditGoalScreen = ({ route, navigation }) => {
  const { goalId } = route.params;
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [motivationReason, setMotivationReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    try {
      const goalData = await getGoal(goalId);
      setTitle(goalData.title);
      setStartDate(new Date(goalData.startDate));
      setTargetDate(new Date(goalData.targetDate));
      setPriority(goalData.priority);
      setMotivationReason(goalData.motivationReason || '');
    } catch (error) {
      console.error('Error loading goal:', error);
      Alert.alert('Error', 'Failed to load goal data');
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate days between dates
  const calculateDaysDifference = (start, end) => {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Ensure target date is after start date
      if (selectedDate >= targetDate) {
        const newTargetDate = new Date(selectedDate);
        newTargetDate.setDate(newTargetDate.getDate() + 7);
        setTargetDate(newTargetDate);
      }
    }
  };

  const onTargetDateChange = (event, selectedDate) => {
    setShowTargetPicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Ensure target date is after start date
      if (selectedDate > startDate) {
        setTargetDate(selectedDate);
      } else {
        Alert.alert('Invalid Date', 'Target date must be after start date');
      }
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (targetDate <= startDate) {
      Alert.alert('Error', 'Target date must be after start date');
      return;
    }

    const days = calculateDaysDifference(startDate, targetDate);
    if (days > 365) {
      Alert.alert('Error', 'Maximum 365 days allowed between start and target date');
      return;
    }

    setUpdating(true);
    try {
      const startDateFormatted = formatDate(startDate);
      const targetDateFormatted = formatDate(targetDate);

      console.log('📅 Updating goal with dates:', {
        startDate: startDateFormatted,
        targetDate: targetDateFormatted,
        days: days
      });

      await updateGoal(goalId, {
        title: title.trim(),
        startDate: startDateFormatted,
        targetDate: targetDateFormatted,
        priority,
        motivationReason: motivationReason.trim() || null,
      });

      Alert.alert('Success', `Goal updated! Target: ${formatDisplayDate(targetDate)}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating goal:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update goal. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const daysDifference = calculateDaysDifference(startDate, targetDate);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.emoji}>✏️</Text>
        <Text style={styles.subtitle}>Update your goal</Text>

        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Learn React Native"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>{formatDisplayDate(startDate)}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
          />
        )}

        <Text style={styles.label}>Target Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTargetPicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>{formatDisplayDate(targetDate)}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>

        {showTargetPicker && (
          <DateTimePicker
            value={targetDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTargetDateChange}
            minimumDate={new Date(startDate.getTime() + 86400000)} // Next day from start
          />
        )}

        {/* Duration Display */}
        <View style={styles.durationCard}>
          <View style={styles.durationContent}>
            <Text style={styles.durationLabel}>Duration</Text>
            <Text style={styles.durationValue}>{daysDifference} days</Text>
          </View>
          <View style={styles.durationDivider} />
          <View style={styles.durationContent}>
            <Text style={styles.durationLabel}>Weeks</Text>
            <Text style={styles.durationValue}>{Math.round(daysDifference / 7)}</Text>
          </View>
        </View>

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

        <Text style={styles.label}>Why is this Goal important?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What motivates you to achieve this?"
          value={motivationReason}
          onChangeText={setMotivationReason}
          multiline
          numberOfLines={4}
          placeholderTextColor={COLORS.grey}
        />

        <Button title="Update Goal" onPress={handleUpdate} loading={updating} />
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
    marginTop: 8,
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
  dateButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  durationCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  durationContent: {
    alignItems: 'center',
    flex: 1,
  },
  durationLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  durationDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.primary + '30',
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

export default EditGoalScreen;