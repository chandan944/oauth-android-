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
import { getMyDiaries, deleteDiary } from "../../services/diaryService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";

const MyDiariesScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = async () => {
    try {
      const response = await getMyDiaries(0, 10);
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
    loadDiaries();
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Diary", "Are you sure you want to delete this diary?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDiary(id);
            loadDiaries();
            Alert.alert("Success", "Diary deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete diary");
          }
        },
      },
    ]);
  };

  const renderDiary = ({ item }) => (
    <Card>
      <View style={styles.diaryHeader}>
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: MOOD_COLORS[item.mood] + "20" },
          ]}
        >
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood]}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.entryDate)}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{truncateText(item.goodThings, 150)}</Text>

      <View style={styles.footer}>
        <View
          style={[
            styles.badge,
            item.visibility === "PUBLIC"
              ? styles.publicBadge
              : styles.privateBadge,
          ]}
        >
          <Ionicons
            name={
              item.visibility === "PUBLIC"
                ? "globe-outline"
                : "lock-closed-outline"
            }
            size={14}
            color={COLORS.white}
          />
          <Text style={styles.badgeText}>{item.visibility}</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
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
            title="No Diaries Yet"
            message="Start journaling to track your mood and thoughts!"
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
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  date: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textLight,
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
});

export default MyDiariesScreen;
