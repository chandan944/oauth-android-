import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "../common/Card";
import { COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const MessageCard = ({ message, onPress }) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.author}>By {message.authorEmail}</Text>
        </View>
        {message.commentCount > 0 && (
          <View style={styles.commentBadge}>
            <Text style={styles.commentCount}>{message.commentCount}</Text>
          </View>
        )}
      </View>

      <Text style={styles.content}>{truncateText(message.content, 120)}</Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.grey} />
          <Text style={styles.statText}>
            {message.commentCount}{" "}
            {message.commentCount === 1 ? "comment" : "comments"}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
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
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  commentBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  commentCount: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
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

export default MessageCard;
