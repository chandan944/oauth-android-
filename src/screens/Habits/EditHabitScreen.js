import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { getHabit, updateHabit } from '../../services/habitService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../utils/colors';

const EditHabitScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadHabit();
  }, []);

  const loadHabit = async () => {
    try {
      const habitData = await getHabit(habitId);
      setTitle(habitData.title);
      setTargetValue(habitData.targetValue);
    } catch (error) {
      console.error('Error loading habit:', error);
      Alert.alert('Error', 'Failed to load habit data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !targetValue.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setUpdating(true);
    try {
      await updateHabit(habitId, {
        title: title.trim(),
        targetValue: targetValue.trim(),
      });
      Alert.alert('Success', 'Habit updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update habit. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.emoji}>✏️</Text>
        <Text style={styles.subtitle}>Update your habit</Text>

        <Text style={styles.label}>Habit Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Morning Exercise"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Target *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 30 minutes daily"
          value={targetValue}
          onChangeText={setTargetValue}
          placeholderTextColor={COLORS.grey}
        />

        <Button title="Update Habit" onPress={handleUpdate} loading={updating} />
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
});

export default EditHabitScreen;