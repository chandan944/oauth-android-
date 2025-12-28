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
import { getPublicDiaries } from "../../services/diaryService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const DiaryFeedScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = async () => {
    try {
      const response = await getPublicDiaries(page, 10);
      setDiaries(response.content || []);
    } catch (error) {
      console.error("Error loading diaries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadDiaries();
  };

  const renderDiary = ({ item }) => (
    <Card>
      <View style={styles.diaryHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.authorName?.charAt(0) || "A"}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <Text style={styles.date}>{formatDate(item.entryDate)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: MOOD_COLORS[item.mood] + "20" },
          ]}
        >
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood]}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{truncateText(item.goodThings, 150)}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={COLORS.grey} />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.grey} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.myDiariesButton}
          onPress={() => navigation.navigate("MyDiaries")}
        >
          <Ionicons name="book" size={20} color={COLORS.primary} />
          <Text style={styles.myDiariesText}>My Diaries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateDiary")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={diaries}
        renderItem={renderDiary}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No Public Diaries"
            message="Be the first to share your thoughts!"
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  myDiariesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: 20,
  },
  myDiariesText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
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

export default DiaryFeedScreen;
