import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Button from "../common/Button";
import { COLORS } from "../../utils/colors";

const CommentModal = ({ visible, onClose, onSubmit, loading = false }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Comment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write your comment..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            autoFocus
            placeholderTextColor={COLORS.grey}
          />

          <Button
            title="Post Comment"
            onPress={handleSubmit}
            loading={loading}
            disabled={!comment.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default CommentModal;
