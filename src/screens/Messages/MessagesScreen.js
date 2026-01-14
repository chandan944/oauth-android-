import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { getAllMessages, deleteMessage } from "../../services/messageService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";
import { formatText } from "../../utils/formatText";

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await getAllMessages(0, 10);
      setMessages(response.content || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const handleDeleteMessage = (messageId, messageTitle) => {
    Alert.alert(
      "Delete Message",
      `Are you sure you want to delete "${truncateText(messageTitle, 50)}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              Alert.alert("Success", "Message deleted successfully");
              loadMessages();
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert("Error", "Failed to delete message");
            }
          },
        },
      ]
    );
  };

  const handleEditMessage = (messageId) => {
    navigation.navigate("EditMessage", { messageId });
  };

  const renderMessage = ({ item }) => (
    <Card
      onPress={() =>
        navigation.navigate("MessageDetail", { messageId: item.id })
      }
    >
      <View style={styles.messageHeader}>
        
        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            {formatText(truncateText(item.title, 100))}
          </Text>
        </View>
        
        {/* Admin Action Buttons */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() => handleEditMessage(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="eyedrop" size={20} color={COLORS.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteMessage(item.id, item.title)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.content}>
        {formatText(truncateText(item.content, 120))}
      </Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.grey} />
          <Text style={styles.statText}>{item.commentCount} comments</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title="No Messages"
            message="Check back later for announcements!"
          />
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateMessage")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.grey,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default MessagesScreen;