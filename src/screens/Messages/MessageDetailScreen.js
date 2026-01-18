import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { 
  getMessage, 
  addComment, 
  deleteMessage,
  deleteComment 
} from "../../services/messageService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";
import { formatText } from "../../utils/formatText";

const MessageDetailScreen = ({ route, navigation }) => {
  const { messageId } = route.params;
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollViewRef = useRef(null);

  const MAX_COMMENT_LENGTH = 450;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    loadMessage();
  }, []);

  const loadMessage = async () => {
    try {
      const data = await getMessage(messageId);
      setMessage(data);
    } catch (error) {
      console.error("Error loading message:", error);
      Alert.alert("Error", "Failed to load message");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessage();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      Alert.alert("Error", `Comment must be ${MAX_COMMENT_LENGTH} characters or less`);
      return;
    }

    setSubmitting(true);
    try {
      await addComment(messageId, comment);
      setComment("");
      loadMessage();
      Keyboard.dismiss();
      Alert.alert("Success", "Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              Alert.alert("Success", "Message deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert("Error", "Failed to delete message");
            }
          },
        },
      ]
    );
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(messageId, commentId);
              Alert.alert("Success", "Comment deleted successfully");
              loadMessage();
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert("Error", "Failed to delete comment");
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!message) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>
                {formatText(truncateText(message.title, 1000))}
              </Text>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.grey} />
                <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.content}>
              {formatText(truncateText(message.content, 2000))}
            </Text>
          </View>
        </View>
      <View style={styles.inputWrapper}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor="#A0A0A0"
            value={comment}
            onChangeText={(text) => {
              if (text.length <= MAX_COMMENT_LENGTH) {
                setComment(text);
              }
            }}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
          />
          {comment.length > 0 && (
            <Text style={[
              styles.charCount,
              comment.length > MAX_COMMENT_LENGTH * 0.9 && styles.charCountWarning,
              comment.length === MAX_COMMENT_LENGTH && styles.charCountMax
            ]}>
              {comment.length}/{MAX_COMMENT_LENGTH}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!comment.trim() || submitting) && styles.sendButtonDisabled
            ]}
            onPress={handleAddComment}
            disabled={submitting || !comment.trim()}
          >
            {submitting ? (
              <Ionicons name="hourglass-outline" size={22} color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
        <View style={styles.commentsSection}>
          <View style={styles.commentsTitleContainer}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Comments</Text>
            <View style={styles.commentBadge}>
              <Text style={styles.commentBadgeText}>{message.commentCount}</Text>
            </View>
          </View>

          {message.comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            [...message.comments]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentTimeContainer}>
                        <Ionicons name="time-outline" size={12} color={COLORS.grey} />
                        <Text style={styles.commentDate}>
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                      
                      {isAdmin && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.deleteCommentButton}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentContent}>
                      {formatText(truncateText(comment.content, 1000))}
                    </Text>
                  </View>
                </View>
              ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>


    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  messageHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 28,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: "#7F8C8D",
  },
  contentContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  content: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 26,
  },
  commentsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  commentsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
  },
  commentBadge: {
    backgroundColor: (COLORS.primary || "#6C63FF") + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  commentBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary || "#6C63FF",
  },
  emptyComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F8C8D",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#A0A0A0",
    marginTop: 4,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  deleteCommentButton: {
    padding: 4,
    borderRadius: 8,
  },
  commentContent: {
    fontSize: 14,
    color: "#34495E",
    lineHeight: 22,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom:10,
    paddingBottom: Platform.OS === "ios" ? 34 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderRadius:20,
    marginHorizontal:15
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C3E50",
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary || "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: COLORS.primary || "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#D0D0D0",
    shadowOpacity: 0,
    elevation: 0,
  },
  charCount: {
    fontSize: 11,
    color: "#7F8C8D",
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  charCountWarning: {
    color: "#F39C12",
  },
  charCountMax: {
    color: COLORS.danger || "#FF6B6B",
    fontWeight: "600",
  },
});

export default MessageDetailScreen;