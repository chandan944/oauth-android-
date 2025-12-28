import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { 
  createOrUpdateDiary, 
  getTodayDiary 
} from '../../services/diaryService';
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
  const [checkingEntry, setCheckingEntry] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      setCheckingEntry(true);
      
      // Use the new getTodayDiary API
      const todayEntry = await getTodayDiary();

      if (todayEntry) {
        // Load existing diary for editing
        setIsEditMode(true);
        setTitle(todayEntry.title || '');
        setGoodThings(todayEntry.goodThings || '');
        setBadThings(todayEntry.badThings || '');
        setMood(todayEntry.mood || '');
        setIsPublic(todayEntry.visibility === 'PUBLIC');
        
        console.log('📝 Existing diary found for today, loading for edit');
      } else {
        console.log('📝 No entry for today, create mode');
      }
    } catch (error) {
      console.error('❌ Error checking today entry:', error);
      // Continue to create mode if error occurs
    } finally {
      setCheckingEntry(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!goodThings.trim()) {
      Alert.alert('Error', 'Please enter something good that happened');
      return;
    }

    if (!mood) {
      Alert.alert('Error', 'Please select your mood');
      return;
    }

    setLoading(true);
    try {
      const diaryData = {
        title: title.trim(),
        goodThings: goodThings.trim(),
        badThings: badThings.trim() || '',
        mood,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      };

      // Use the new createOrUpdateDiary API
      // Backend automatically handles create vs update
      await createOrUpdateDiary(diaryData);
      
      const successMessage = isEditMode 
        ? 'Diary updated successfully! ✏️' 
        : 'Diary created successfully! 📖';
      
      Alert.alert(
        'Success', 
        successMessage, 
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Error saving diary:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to save diary. Please try again.';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while checking for today's entry
  if (checkingEntry) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading today's entry...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Header Banner */}
        <View style={[
          styles.headerBanner,
          isEditMode && styles.headerBannerEdit
        ]}>
          <Text style={styles.bannerEmoji}>
            {isEditMode ? '✏️' : '✍️'}
          </Text>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerText}>
              {isEditMode ? 'Edit Today\'s Entry' : 'Today\'s Entry'}
            </Text>
            {isEditMode && (
              <Text style={styles.bannerSubtext}>
                Updating your diary for today
              </Text>
            )}
          </View>
        </View>

        {/* Info Box - Only show in edit mode */}
        {isEditMode && (
          <View style={styles.editInfoBox}>
            <Text style={styles.editInfoText}>
              ℹ️ You already have an entry for today. Your changes will update the existing entry.
            </Text>
          </View>
        )}

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
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Make Public</Text>
            <Text style={styles.switchSubtext}>
              {isPublic ? '🌍 Visible to everyone' : '🔒 Only you can see'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isPublic ? COLORS.primary : COLORS.white}
          />
        </View>

        {/* Info box about one entry per day - Only show in create mode */}
        {!isEditMode && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ You can create one diary entry per day. You can edit it anytime today.
            </Text>
          </View>
        )}

        <Button 
          title={isEditMode ? 'Update Diary' : 'Create Diary'} 
          onPress={handleSave} 
          loading={loading} 
        />

        {/* Show cancel button in edit mode */}
        {isEditMode && (
          <Button 
            title="Cancel" 
            onPress={() => navigation.goBack()} 
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 12,
  },
  form: {
    padding: 16,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerBannerEdit: {
    backgroundColor: COLORS.warning + '15',
  },
  bannerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bannerSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  editInfoBox: {
    backgroundColor: COLORS.warning + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  editInfoText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  infoBox: {
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
});

export default CreateDiaryScreen;