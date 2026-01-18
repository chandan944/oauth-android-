import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  getComments,
  addComment,
  deleteComment,
} from "../../services/diaryService";
import { COLORS } from "../../utils/colors";

// Separate Comment Component
const CommentItem = ({ item, index, currentUserEmail, onDelete }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp + "Z");
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now ⏱️";
    if (diffMins < 60) return `${diffMins}m ago ⌛`;
    if (diffHours < 24) return `${diffHours}h ago ⏰`;
    if (diffDays < 7) return `${diffDays}d ago 📆`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
      "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
      "#F8B500", "#FF85A2"
    ];
    return colors[id % colors.length];
  };

  return (
    <Animated.View
      style={[
        styles.commentItem,
        {
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthor}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: getAvatarColor(item.authorId) },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(item.authorName)}
              </Text>
            </View>

            <View style={styles.commentInfo}>
              <Text style={styles.authorName}>{item.authorName}</Text>
              <View style={styles.timestampContainer}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={COLORS.textLight}
                />
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {item.authorId === currentUserEmail && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.deleteButton}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </Animated.View>
  );
};

const CommentsModal = ({ visible, onClose, diaryId, currentUserEmail }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && diaryId) {
      loadComments(0, true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, diaryId]);

  const loadComments = async (pageNum = 0, reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);
      const response = await getComments(diaryId, pageNum, 20);

      if (reset) {
        setComments(response.content || []);
      } else {
        setComments((prev) => [...prev, ...(response.content || [])]);
      }

      setPage(pageNum);
      setHasMore(!response.last);
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      const newComment = await addComment(diaryId, commentText.trim());

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      Keyboard.dismiss();

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setCommenting(false);
    }
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
              await deleteComment(diaryId, commentId);
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert("Error", "Failed to delete comment");
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    // Pass the current comment count back to the parent
    onClose(comments.length);
  };

  const renderComment = ({ item, index }) => (
    <CommentItem
      item={item}
      index={index}
      currentUserEmail={currentUserEmail}
      onDelete={handleDeleteComment}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={false}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Input Section at Top */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputShadow}>
            <View style={styles.inputContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Share your thoughts..."
                  placeholderTextColor={COLORS.textLight}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {commentText.length}/500
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || commenting) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || commenting}
                activeOpacity={0.8}
              >
                {commenting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="chatbubbles"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.headerTitle}>Comments</Text>
              <View style={styles.commentCount}>
                <Text style={styles.commentCountText}>{comments.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.commentsList}
          onEndReached={() => loadComments(page + 1)}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <Animated.View
                style={[styles.emptyState, { opacity: fadeAnim }]}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={64}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to share your thoughts!
                </Text>
              </Animated.View>
            )
          }
          ListFooterComponent={
            loading && page > 0 ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1e0ec",
    marginBottom: 5,
  },
  headerGradient: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: 0.5,
  },
  commentCount: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: "center",
  },
  commentCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    padding: 16,
    paddingBottom: 24,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  commentInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
  },
  commentText: {
    fontSize: 15,
    color: "#2C2C2C",
    lineHeight: 22,
    fontWeight: "400",
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  inputShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputBox: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  input: {
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    color: "#1A1A2E",
    fontWeight: "400",
  },
  charCount: {
    fontSize: 11,
    color: "#B0B0B0",
    textAlign: "right",
    marginTop: 4,
    fontWeight: "500",
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#D0D0D0",
    shadowOpacity: 0.1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#9E9E9E",
    textAlign: "center",
    fontWeight: "500",
  },
  loader: {
    paddingVertical: 20,
  },
});

export default CommentsModal;