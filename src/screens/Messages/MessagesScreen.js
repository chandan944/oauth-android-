import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAllMessages } from "../../services/messageService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const MessagesScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await getAllMessages(0, 10);
      setMessages(response.content || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const renderMessage = ({ item }) => (
    <Card
      onPress={() =>
        navigation.navigate("MessageDetail", { messageId: item.id })
      }
    >
      <View style={styles.messageHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>By {item.authorEmail}</Text>
        </View>
      </View>

      <Text style={styles.content}>{truncateText(item.content, 120)}</Text>

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
  author: {
    fontSize: 12,
    color: COLORS.textLight,
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
});

export default MessagesScreen;
