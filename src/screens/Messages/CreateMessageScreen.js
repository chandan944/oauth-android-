import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createMessage } from "../../services/messageService";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { COLORS } from "../../utils/colors";

const CreateMessageScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateMessage = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Error", "Please enter message content");
      return;
    }
    if (title.length > 200) {
      Alert.alert("Error", "Title must be less than 200 characters");
      return;
    }
    if (content.length > 1000) {
      Alert.alert("Error", "Content must be less than 1000 characters");
      return;
    }

    setLoading(true);
    try {
      await createMessage({ title, content });
      Alert.alert("Success", "Message created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating message:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter message title"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            placeholderTextColor={COLORS.grey}
          />
          <Text style={styles.charCount}>{title.length}/200</Text>

          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter message content"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            maxLength={1000}
            placeholderTextColor={COLORS.grey}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Create Message"
              onPress={handleCreateMessage}
              loading={loading}
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: COLORS.grey,
    textAlign: "right",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default CreateMessageScreen;