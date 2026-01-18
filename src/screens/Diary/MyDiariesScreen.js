import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getMyDiaries, deleteDiary } from "../../services/diaryService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";
import { formatText } from "../../utils/formatText";
import CommentsModal from "./CommentsModal";

const MyDiariesScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Comments modal states
  const [selectedDiaryForComments, setSelectedDiaryForComments] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // You'll need to get this from your auth context/store
  const currentUserEmail = "user@example.com"; // TODO: Get from auth context

  // Date Filter States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadDiaries(0, true);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      onRefresh();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (isFilterActive) {
      filterByDate(selectedDate);
    } else {
      setFilteredDiaries(diaries);
    }
  }, [diaries, isFilterActive, selectedDate]);

  const loadDiaries = async (page = 0, reset = false) => {
    if (!hasMore && !reset) return;

    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await getMyDiaries(page, PAGE_SIZE);
      
      const sortedDiaries = (response.content || []).sort((a, b) => {
        return new Date(b.entryDate) - new Date(a.entryDate);
      });

      if (reset || page === 0) {
        setDiaries(sortedDiaries);
        setFilteredDiaries(sortedDiaries);
      } else {
        setDiaries((prev) => [...prev, ...sortedDiaries]);
      }

      setCurrentPage(response.pageable?.pageNumber || page);
      setTotalPages(response.totalPages || 0);
      setHasMore(!response.last);

      console.log("📝 My diaries loaded - Page:", page, "Total:", sortedDiaries.length);
    } catch (error) {
      console.error("Error loading my diaries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    setIsFilterActive(false);
    setSelectedDate(new Date());
    loadDiaries(0, true);
  };

  const loadMoreDiaries = () => {
    if (!isLoadingMore && hasMore && !isFilterActive) {
      loadDiaries(currentPage + 1);
    }
  };

  const openComments = (diary) => {
    setSelectedDiaryForComments(diary);
    setShowCommentsModal(true);
  };

  const handleCloseComments = (updatedCommentCount) => {
    // Update the comment count for the specific diary
    if (selectedDiaryForComments && updatedCommentCount !== undefined) {
      const updateDiaryCommentCount = (diaryList) => 
        diaryList.map(diary => 
          diary.id === selectedDiaryForComments.id 
            ? { ...diary, commentCount: updatedCommentCount }
            : diary
        );
      
      setDiaries(updateDiaryCommentCount);
      setFilteredDiaries(updateDiaryCommentCount);
    }
    
    setShowCommentsModal(false);
    setSelectedDiaryForComments(null);
  };

  const filterByDate = (date) => {
    const filtered = diaries.filter((diary) => {
      const diaryDate = new Date(diary.entryDate);
      const filterDate = new Date(date);

      return (
        diaryDate.getFullYear() === filterDate.getFullYear() &&
        diaryDate.getMonth() === filterDate.getMonth() &&
        diaryDate.getDate() === filterDate.getDate()
      );
    });

    setFilteredDiaries(filtered);
    setIsFilterActive(true);
    console.log(`📅 Filtered ${filtered.length} diaries for ${formatDate(date)}`);
  };

  const clearFilter = () => {
    setSelectedDate(new Date());
    setFilteredDiaries(diaries);
    setIsFilterActive(false);
  };

  const onDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && date) {
      setSelectedDate(date);
      if (Platform.OS === "android") {
        filterByDate(date);
      }
    }

    if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const handleIOSConfirm = () => {
    setShowDatePicker(false);
    filterByDate(selectedDate);
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
            onRefresh();
            Alert.alert("Success", "Diary deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete diary");
          }
        },
      },
    ]);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more diaries...</Text>
      </View>
    );
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
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditDiary', { diary: item })}
            style={styles.iconButton}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            style={styles.iconButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>
        {formatText(truncateText(item.goodThings, 3000))}
      </Text>

      {item.badThings && (
        <View style={styles.challengesSection}>
          <Text style={styles.challengesLabel}>Challenges:</Text>
          <Text style={styles.challengesText}>
            {formatText(truncateText(item.badThings, 3000))}
          </Text>
        </View>
      )}

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

      <TouchableOpacity
        style={styles.commentButton}
        onPress={() => openComments(item)}
      >
        <Ionicons name="chatbubble-outline" size={20} color={COLORS.text} />
        <Text style={styles.commentButtonText}>
          {item.commentCount > 0 
            ? `${item.commentCount} ${item.commentCount === 1 ? 'comment' : 'comments'}`
            : 'Add a comment'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  if (loading && currentPage === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.dateButtonText}>
                {isFilterActive ? formatDate(selectedDate) : "Filter by Date"}
              </Text>
            </TouchableOpacity>

            {isFilterActive && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilter}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          {Platform.OS === "ios" && (
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.iosButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.iosHeaderTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleIOSConfirm}>
                <Text style={[styles.iosButtonText, styles.iosConfirmText]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
        </View>
      )}

      <FlatList
        data={filteredDiaries}
        renderItem={renderDiary}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreDiaries}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title={isFilterActive ? "No Diaries Found" : "No Diaries Yet"}
            message={
              isFilterActive
                ? "No diaries found for the selected date"
                : "Start journaling to track your mood and thoughts!"
            }
          />
        }
      />

      {showCommentsModal && selectedDiaryForComments && (
        <CommentsModal
          visible={showCommentsModal}
          onClose={handleCloseComments}
          diaryId={selectedDiaryForComments.id}
          currentUserEmail={currentUserEmail}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 5,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "10",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  clearButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        paddingBottom: 10,
      },
    }),
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  iosButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  iosConfirmText: {
    fontWeight: "600",
  },
  datePicker: {
    width: "100%",
    ...Platform.select({
      ios: {
        height: 200,
      },
    }),
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
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
    marginBottom: 12,
  },
  challengesSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.warning + "10",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  challengesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.warning,
    marginBottom: 4,
  },
  challengesText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default MyDiariesScreen;