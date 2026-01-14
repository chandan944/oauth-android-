import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { createHabit } from '../../services/habitService';
import Button from '../../components/common/Button';
import { COLORS } from '../../utils/colors';

const CreateHabitScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>💛</Text>
        </View>
        <Text style={styles.title}>Create New Habit</Text>
        <Text style={styles.subtitle}>Build a new healthy habit and track your progress</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Habit Name</Text>
          <View style={[
            styles.inputContainer,
            focusedField === 'title' && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputIcon}>✏️</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Exercise"
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Target</Text>
          <View style={[
            styles.inputContainer,
            focusedField === 'target' && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputIcon}>🎯</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30 minutes daily"
              value={targetValue}
              onChangeText={setTargetValue}
              onFocus={() => setFocusedField('target')}
              onBlur={() => setFocusedField(null)}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        

        <Button 
          title="Create Habit" 
          onPress={handleCreate} 
          loading={loading}
          style={styles.createButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: COLORS.primary || '#6C63FF',
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    padding: 24,
    marginTop: -16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary || '#6C63FF',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#6D4C41',
    lineHeight: 20,
  },
  createButton: {
    marginTop: 16,
  },
});

export default CreateHabitScreen;