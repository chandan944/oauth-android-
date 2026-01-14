import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { 
  getMessage, 
  addComment, 
  deleteMessage,
  deleteComment 
} from "../../services/messageService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, formatTime, truncateText } from "../../utils/helpers";
import { formatText } from "../../utils/formatText";

const MessageDetailScreen = ({ route, navigation }) => {
  const { messageId } = route.params;
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

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

    setSubmitting(true);
    try {
      await addComment(messageId, comment);
      setComment("");
      loadMessage();
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

  const handleEditMessage = () => {
    navigation.navigate("EditMessage", { messageId });
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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
              {formatText(truncateText(message.content, 1000))}
            </Text>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsTitleContainer}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.primary || "#6C63FF"} />
            <Text style={styles.sectionTitle}>
              Comments
            </Text>
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
            message.comments.map((comment, index) => (
              <View key={comment.id} style={styles.comment}>
                
                
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentTimeContainer}>
                      <Ionicons name="time-outline" size={12} color={COLORS.grey} />
                      <Text style={styles.commentDate}>
                        {formatTime(comment.createdAt)}
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

      <View style={styles.commentInputWrapper}>
        <View style={[
          styles.commentInput,
          focusedInput && styles.commentInputFocused
        ]}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="chatbox-outline" size={20} color={COLORS.primary || "#6C63FF"} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            multiline
            placeholderTextColor="#A0A0A0"
          />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: (COLORS.primary || "#6C63FF") + "15",
  },
  deleteButton: {
    backgroundColor: COLORS.danger || "#FF6B6B",
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: (COLORS.primary || "#6C63FF") + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  commentIconWrapper: {
    marginRight: 12,
  },
  commentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: (COLORS.primary || "#6C63FF") + "15",
    justifyContent: "center",
    alignItems: "center",
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
  commentInputWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  commentInputFocused: {
    borderColor: COLORS.primary || "#6C63FF",
    backgroundColor: "#FFFFFF",
  },
  inputIconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C3E50",
    paddingVertical: 12,
    maxHeight: 100,
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
});

export default MessageDetailScreen;