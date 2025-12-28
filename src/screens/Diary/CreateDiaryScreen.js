import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { createDiary } from '../../services/diaryService';
import Button from '../../components/common/Button';
import MoodSelector from '../../components/common/MoodSelector';
import { COLORS } from '../../utils/colors';

const CreateDiaryScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [goodThings, setGoodThings] = useState('');
  const [badThings, setBadThings] = useState('');
  const [mood, setMood] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !goodThings || !mood) {
      Alert.alert('Error', 'Please fill required fields and select a mood');
      return;
    }

    setLoading(true);
    try {
      await createDiary({
        title,
        goodThings,
        badThings,
        mood,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      });
      Alert.alert('Success', 'Diary created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating diary:', error);
      Alert.alert('Error', 'Failed to create diary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="What happened today?"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.grey}
        />

        <MoodSelector selectedMood={mood} onSelectMood={setMood} />

        <Text style={styles.label}>Good Things *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What went well today?"
          value={goodThings}
          onChangeText={setGoodThings}
          multiline
          numberOfLines={4}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={styles.label}>Challenges (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What could have been better?"
          value={badThings}
          onChangeText={setBadThings}
          multiline
          numberOfLines={4}
          placeholderTextColor={COLORS.grey}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Make Public</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isPublic ? COLORS.primary : COLORS.white}
          />
        </View>

        <Button title="Create Diary" onPress={handleCreate} loading={loading} />
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default CreateDiaryScreen;