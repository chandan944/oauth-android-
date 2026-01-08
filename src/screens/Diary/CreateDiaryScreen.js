import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { createDiary } from "../../services/diaryService";
import Button from "../../components/common/Button";
import MoodSelector from "../../components/common/MoodSelector";
import { COLORS } from "../../utils/colors";
import { formatText } from "../../utils/formatText";

const CreateDiaryScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [goodThings, setGoodThings] = useState("");
  const [badThings, setBadThings] = useState("");
  const [mood, setMood] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!goodThings.trim()) {
      Alert.alert("Error", "Please enter something good that happened");
      return;
    }

    if (!mood) {
      Alert.alert("Error", "Please select your mood");
      return;
    }

    setLoading(true);
    try {
      const diaryData = {
        title: title.trim(),
        goodThings: goodThings.trim(),
        badThings: badThings.trim() || "",
        mood,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",
      };

      await createDiary(diaryData);

      Alert.alert("Success", "Diary created successfully! 📖", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setGoodThings("");
            setBadThings("");
            setMood("");
            setIsPublic(true);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error saving diary:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save diary. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="What happened today?"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.grey}
        />

        <MoodSelector selectedMood={mood} onSelectMood={setMood} />

        <Text style={styles.label}>Good Things that happened today</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What went well today?"
          value={goodThings}
          onChangeText={(text) => {
            if (text.length <= 900) {
              setGoodThings(text);
            }
          }}
          multiline
          numberOfLines={4}
          maxLength={900}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={{ alignSelf: "flex-end", color: COLORS.grey }}>
          {goodThings.length}/900 ✍️
        </Text>
        <Text
          style={{ marginTop: 8, color: COLORS.primary, fontWeight: "600" }}
        >
          ✨ Live Preview
        </Text>

        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{formatText(goodThings)}</Text>
        </View>

        <Text style={styles.label}>Challenges</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What Challenges today?"
          value={badThings}
          onChangeText={(text) => {
            if (text.length <= 900) {
              setBadThings(text);
            }
          }}
          multiline
          numberOfLines={4}
          maxLength={900}
          placeholderTextColor={COLORS.grey}
        />

        <Text style={{ alignSelf: "flex-end", color: COLORS.grey }}>
          {badThings.length}/900 ✍️
        </Text>
        <Text
          style={{ marginTop: 8, color: COLORS.primary, fontWeight: "600" }}
        >
          ✨ Live Preview
        </Text>

        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{formatText(badThings)}</Text>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Make Public</Text>
            <Text style={styles.switchSubtext}>
              {isPublic ? "🌍 Visible to everyone" : "🔒 Only you can see"}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
            thumbColor={isPublic ? COLORS.primary : COLORS.white}
          />
        </View>



        <Button title="Create Diary" onPress={handleSave} loading={loading} />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
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
  previewBox: {
    marginTop: 6,
    marginBottom:6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
  },
  previewText: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 22,
  },

  headerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary + "15",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    fontWeight: "bold",
    color: COLORS.primary,
  },
  bannerSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  label: {
    marginTop:20,
    fontSize: 14,
    fontWeight: "600",
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
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  infoBox: {
    backgroundColor: COLORS.primary + "10",
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
