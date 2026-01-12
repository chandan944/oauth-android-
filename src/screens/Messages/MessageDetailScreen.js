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

  useEffect(() => {
    if (isAdmin) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleEditMessage}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteMessage}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, isAdmin]);

  if (loading) return <LoadingSpinner />;
  if (!message) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.messageCard}>
          <View style={styles.header}>
            
            <View style={styles.headerInfo}>
              <Text style={styles.title}>
                {formatText(truncateText(message.title, 1000))}
              </Text>
              <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.content}>
            {formatText(truncateText(message.content, 1000))}
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            Comments ({message.commentCount})
          </Text>

          {message.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentDate}>
                  {formatTime(comment.createdAt)}
                </Text>
                
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
          ))}
        </Card>
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
          multiline
          placeholderTextColor={COLORS.grey}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={submitting}
        >
          <Ionicons name="send" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messageCard: {
    margin: 16,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.grey,
  },
  content: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  comment: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.grey,
  },
  deleteCommentButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 24,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
});

export default MessageDetailScreen;