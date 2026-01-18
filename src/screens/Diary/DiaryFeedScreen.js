import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getPublicDiaries } from "../../services/diaryService";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_EMOJIS, MOOD_COLORS } from "../../utils/colors";
import { formatDate, truncateText } from "../../utils/helpers";
import { formatText } from "../../utils/formatText";

const DiaryFeedScreen = ({ navigation, route }) => {
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadDiaries(0, true);
  }, []);

  // Listen for refresh from create diary screen
  useEffect(() => {
    if (route.params?.refresh) {
      onRefresh();
      // Clear the param
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // Auto-refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Always refresh when screen is focused
      onRefresh();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedDate) {
      filterDiariesByDate(selectedDate);
    } else {
      setFilteredDiaries(diaries);
    }
  }, [diaries, selectedDate]);

  const loadDiaries = async (page = 0, reset = false) => {
    if (!hasMore && !reset) return;

    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await getPublicDiaries(page, PAGE_SIZE);
      
      // Sort by entryDate and createdAt descending (newest first)
      // This ensures newly created diaries appear first
      const sortedDiaries = (response.content || []).sort((a, b) => {
        // First compare by entry date
        const dateComparison = new Date(b.entryDate) - new Date(a.entryDate);
        
        // If entry dates are the same, sort by creation time (if available)
        if (dateComparison === 0 && a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        
        // If entry dates are the same but no createdAt, sort by ID (assuming higher ID = newer)
        if (dateComparison === 0) {
          return b.id - a.id;
        }
        
        return dateComparison;
      });

      if (reset || page === 0) {
        setDiaries(sortedDiaries);
      } else {
        setDiaries((prev) => [...prev, ...sortedDiaries]);
      }

      setCurrentPage(response.pageable?.pageNumber || page);
      setTotalPages(response.totalPages || 0);
      setHasMore(!response.last);

      console.log("📱 Loaded page:", page, "Total pages:", response.totalPages);
    } catch (error) {
      console.error("Error loading diaries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedDate(null);
    setCurrentPage(0);
    setHasMore(true);
    loadDiaries(0, true);
  };

  const loadMoreDiaries = () => {
    if (!isLoadingMore && hasMore && !selectedDate) {
      loadDiaries(currentPage + 1);
    }
  };

  const filterDiariesByDate = (date) => {
    if (!date) {
      setFilteredDiaries(diaries);
      return;
    }

    const filtered = diaries.filter((diary) => {
      const diaryDate = new Date(diary.entryDate);
      return (
        diaryDate.getDate() === date.getDate() &&
        diaryDate.getMonth() === date.getMonth() &&
        diaryDate.getFullYear() === date.getFullYear()
      );
    });

    setFilteredDiaries(filtered);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    filterDiariesByDate(date);

    if (Platform.OS === "ios") {
      setShowFilterModal(false);
    }
  };

  const handleAndroidDateChange = (event, date) => {
    setShowDatePicker(false);

    if (event.type === "set" && date) {
      setSelectedDate(date);
      filterDiariesByDate(date);
    }
  };

  const clearFilter = () => {
    setSelectedDate(null);
    setFilteredDiaries(diaries);
    setShowFilterModal(false);
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
        <View style={styles.authorInfo}>
          <View style={styles.authorTextContainer}>
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
    </Card>
  );

  if (loading && currentPage === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.myDiariesButton}
          onPress={() => navigation.navigate("MyDiaries")}
        >
          <Ionicons name="book" size={20} color={COLORS.black} />
          <Text style={styles.myDiariesText}>My Diaries</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            if (Platform.OS === "ios") {
              setShowFilterModal(true);
            } else {
              setShowDatePicker(true);
            }
          }}
        >
          <Ionicons
            name={selectedDate ? "filter" : "filter-outline"}
            size={20}
            color={selectedDate ? COLORS.primary : COLORS.black}
          />
          <Text
            style={[
              styles.filterText,
              selectedDate && styles.filterTextActive,
            ]}
          >
            Filter
          </Text>
          {selectedDate && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateDiary")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {selectedDate && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            Showing diaries from{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <TouchableOpacity onPress={clearFilter}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {showFilterModal && Platform.OS === "ios" && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFilterModal}
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter by Date</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="inline"
                onChange={(event, date) => {
                  if (date) {
                    handleDateSelect(date);
                  }
                }}
                maximumDate={new Date()}
                style={styles.datePicker}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilter}
                >
                  <Text style={styles.clearButtonText}>Clear Filter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleAndroidDateChange}
          maximumDate={new Date()}
        />
      )}

      <FlatList
        data={filteredDiaries}
        renderItem={renderDiary}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          filteredDiaries.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreDiaries}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={
              selectedDate ? "No Diaries on This Date" : "No Public Diaries"
            }
            message={
              selectedDate
                ? "Try another date or clear the filter"
                : "Be the first to share your thoughts!"
            }
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: 25,
    flex: 1,
    marginRight: 12,
  },
  myDiariesText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    position: "relative",
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#010501",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryLight + "10",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterInfoText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
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
    flex: 1,
  },
  authorTextContainer: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
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
    marginLeft: 12,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  datePicker: {
    height: 320,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default DiaryFeedScreen;