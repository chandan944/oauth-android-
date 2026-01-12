import React, { useState, useEffect } from "react";
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
import { getMessage, updateMessage } from "../../services/messageService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";

const EditMessageScreen = ({ route, navigation }) => {
  const { messageId } = route.params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessage();
  }, []);

  const loadMessage = async () => {
    try {
      const data = await getMessage(messageId);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error("Error loading message:", error);
      Alert.alert("Error", "Failed to load message");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Error", "Please enter content");
      return;
    }

    setSubmitting(true);
    try {
      await updateMessage(messageId, {
        title: title.trim(),
        content: content.trim(),
      });
      Alert.alert("Success", "Message updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating message:", error);
      Alert.alert("Error", "Failed to update message");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter message title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter message content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              placeholderTextColor={COLORS.grey}
            />
          </View>

          <Button
            title={submitting ? "Updating..." : "Update Message"}
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 200,
    maxHeight: 400,
  },
});

export default EditMessageScreen;