import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { createHabit } from '../../services/habitService';
import Button from '../../components/common/Button';
import { COLORS } from '../../utils/colors';

const CreateHabitScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !targetValue) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await createHabit({ title, targetValue });
      Alert.alert('Success', 'Habit created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.emoji}>🔁</Text>
        <Text style={styles.subtitle}>Build a new healthy habit</Text>

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

        <Button title="Create Habit" onPress={handleCreate} loading={loading} />
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
});

export default CreateHabitScreen;
