import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from '../../utils/colors';

const moods = ['HAPPY', 'OKAY', 'SAD', 'ANGRY', 'TIRED'];

const MoodSelector = ({ selectedMood, onSelectMood }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling? 💭</Text>
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              selectedMood === mood && styles.selectedMood,
              { borderColor: MOOD_COLORS[mood] },
            ]}
            onPress={() => onSelectMood(mood)}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
            <Text style={styles.moodLabel}>{mood}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  selectedMood: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default MoodSelector;