import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "../common/Card";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const DiaryCard = ({
  diary,
  onPress,
  showAuthor = true,
  showActions = true,
}) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        {showAuthor && (
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {diary.authorName?.charAt(0) || "A"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>
                {diary.authorName || "Anonymous"}
              </Text>
              <Text style={styles.date}>{formatDate(diary.entryDate)}</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: MOOD_COLORS[diary.mood] + "20" },
          ]}
        >
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[diary.mood]}</Text>
        </View>
      </View>

      <Text style={styles.title}>{diary.title}</Text>
      <Text style={styles.content}>{truncateText(diary.goodThings, 150)}</Text>

      {diary.visibility && (
        <View style={styles.footer}>
          <View
            style={[
              styles.badge,
              diary.visibility === "PUBLIC"
                ? styles.publicBadge
                : styles.privateBadge,
            ]}
          >
            <Ionicons
              name={
                diary.visibility === "PUBLIC"
                  ? "globe-outline"
                  : "lock-closed-outline"
              }
              size={14}
              color={COLORS.white}
            />
            <Text style={styles.badgeText}>{diary.visibility}</Text>
          </View>
        </View>
      )}

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color={COLORS.grey} />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.grey} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={COLORS.grey} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  publicBadge: {
    backgroundColor: COLORS.success,
  },
  privateBadge: {
    backgroundColor: COLORS.grey,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.grey,
  },
});

export default DiaryCard;
