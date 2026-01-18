import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { updateDiary } from "../../services/diaryService";
import Button from "../../components/common/Button";
import MoodSelector from "../../components/common/MoodSelector";
import { COLORS } from "../../utils/colors";
import { formatText } from "../../utils/formatText";

const EditDiaryScreen = ({ navigation, route }) => {
  const { diary } = route.params; // Get diary data from navigation params
  
  const [title, setTitle] = useState(diary.title || "");
  const [goodThings, setGoodThings] = useState(diary.goodThings || "");
  const [badThings, setBadThings] = useState(diary.badThings || "");
  const [mood, setMood] = useState(diary.mood || "");
  const [isPublic, setIsPublic] = useState(diary.visibility === "PUBLIC");
  const [loading, setLoading] = useState(false);
  const [showGoodPreview, setShowGoodPreview] = useState(false);
  const [showBadPreview, setShowBadPreview] = useState(false);

  const handleUpdate = async () => {
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

      await updateDiary(diary.id, diaryData);

      Alert.alert("Success", "Diary updated successfully! ✨", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error updating diary:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update diary. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCountColor = (length, max) => {
    const percentage = (length / max) * 100;
    if (percentage >= 90) return "#FF5252";
    if (percentage >= 75) return "#FFA726";
    return "#9E9E9E";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Title Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What happened today?"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#B0B0B0"
              maxLength={200}
            />
          </View>
        </View>

        {/* Mood Selector */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="happy-outline" size={20} color="#6C5CE7" />
            <Text style={styles.label}>How are you feeling?</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>
          <MoodSelector selectedMood={mood} onSelectMood={setMood} />
        </View>

        {/* Good Things Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="sunny" size={20} color="#4CAF50" />
            <Text style={styles.label}>Good Things Today</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="What made you smile today? Share the highlights..."
              value={goodThings}
              onChangeText={(text) => {
                if (text.length <= 3000) {
                  setGoodThings(text);
                }
              }}
              multiline
              numberOfLines={4}
              maxLength={3000}
              placeholderTextColor="#B0B0B0"
            />
            <View style={styles.characterCount}>
              <Text
                style={[
                  styles.countText,
                  { color: getCharacterCountColor(goodThings.length, 3000) },
                ]}
              >
                {goodThings.length}/3000
              </Text>
            </View>
          </View>

          {goodThings.trim() && (
            <TouchableOpacity
              style={styles.previewToggle}
              onPress={() => setShowGoodPreview(!showGoodPreview)}
            >
              <Ionicons
                name={showGoodPreview ? "eye-off" : "eye"}
                size={16}
                color="#6C5CE7"
              />
              <Text style={styles.previewToggleText}>
                {showGoodPreview ? "Hide" : "Show"} Preview
              </Text>
            </TouchableOpacity>
          )}

          {showGoodPreview && goodThings.trim() && (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Ionicons name="sparkles" size={16} color="#FFD700" />
                <Text style={styles.previewTitle}>Preview</Text>
              </View>
              <Text style={styles.previewText}>{formatText(goodThings)}</Text>
            </View>
          )}
        </View>

        {/* Challenges Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="fitness" size={20} color="#FF9800" />
            <Text style={styles.label}>Challenges & Learnings</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="What challenged you? What did you learn?"
              value={badThings}
              onChangeText={(text) => {
                if (text.length <= 3000) {
                  setBadThings(text);
                }
              }}
              multiline
              numberOfLines={4}
              maxLength={3000}
              placeholderTextColor="#B0B0B0"
            />
            <View style={styles.characterCount}>
              <Text
                style={[
                  styles.countText,
                  { color: getCharacterCountColor(badThings.length, 3000) },
                ]}
              >
                {badThings.length}/3000
              </Text>
            </View>
          </View>

          {badThings.trim() && (
            <TouchableOpacity
              style={styles.previewToggle}
              onPress={() => setShowBadPreview(!showBadPreview)}
            >
              <Ionicons
                name={showBadPreview ? "eye-off" : "eye"}
                size={16}
                color="#6C5CE7"
              />
              <Text style={styles.previewToggleText}>
                {showBadPreview ? "Hide" : "Show"} Preview
              </Text>
            </TouchableOpacity>
          )}

          {showBadPreview && badThings.trim() && (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Ionicons name="sparkles" size={16} color="#FFD700" />
                <Text style={styles.previewTitle}>Preview</Text>
              </View>
              <Text style={styles.previewText}>{formatText(badThings)}</Text>
            </View>
          )}
        </View>

        {/* Privacy Toggle */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyLeft}>
            <View
              style={[
                styles.privacyIcon,
                { backgroundColor: isPublic ? "#E3F2FD" : "#F3E5F5" },
              ]}
            >
              <Ionicons
                name={isPublic ? "globe" : "lock-closed"}
                size={24}
                color={isPublic ? "#2196F3" : "#9C27B0"}
              />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>
                {isPublic ? "Public Entry" : "Private Entry"}
              </Text>
              <Text style={styles.privacySubtext}>
                {isPublic
                  ? "Visible to everyone in community"
                  : "Only you can see this"}
              </Text>
            </View>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: "#E0E0E0", true: "#B39DDB" }}
            thumbColor={isPublic ? "#6C5CE7" : "#F5F5F5"}
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Update Diary Entry"
            onPress={handleUpdate}
            loading={loading}
            style={styles.saveButton}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF5252",
  },
  optionalBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4CAF50",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#2D3436",
  },
  textAreaContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    position: "relative",
  },
  textArea: {
    padding: 16,
    fontSize: 15,
    color: "#2D3436",
    minHeight: 120,
    textAlignVertical: "top",
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
  },
  previewToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0EEFF",
    borderRadius: 12,
    gap: 6,
  },
  previewToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C5CE7",
  },
  previewBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1A1A2E",
    borderWidth: 2,
    borderColor: "#6C5CE7",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFD700",
  },
  previewText: {
    color: "#F8F9FA",
    fontSize: 15,
    lineHeight: 24,
  },
  privacyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  privacyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  privacyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 4,
  },
  privacySubtext: {
    fontSize: 12,
    color: "#636E72",
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    elevation: 4,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#636E72",
  },
});

export default EditDiaryScreen;