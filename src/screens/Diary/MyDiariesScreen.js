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

const MyDiariesScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]); // 📌 For filtered results
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📅 Date Filter States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    loadDiaries();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDiaries();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDiaries = async () => {
    try {
      const response = await getMyDiaries(0, 10);
      console.log("📝 My diaries loaded:", response.content?.length || 0);
      setDiaries(response.content || []);
      setFilteredDiaries(response.content || []); // Set initial filtered data
    } catch (error) {
      console.error("Error loading my diaries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDiaries();
  };

  // 🎯 Filter diaries by selected date
  const filterByDate = (date) => {
    const filtered = diaries.filter((diary) => {
      const diaryDate = new Date(diary.entryDate);
      const filterDate = new Date(date);

      // Compare only year, month, and day (ignore time)
      return (
        diaryDate.getFullYear() === filterDate.getFullYear() &&
        diaryDate.getMonth() === filterDate.getMonth() &&
        diaryDate.getDate() === filterDate.getDate()
      );
    });

    setFilteredDiaries(filtered);
    setIsFilterActive(true);
    console.log(
      `📅 Filtered ${filtered.length} diaries for ${formatDate(date)}`
    );
  };

  // 🔄 Reset filter to show all diaries
  const clearFilter = () => {
    setSelectedDate(new Date());
    setFilteredDiaries(diaries);
    setIsFilterActive(false);
  };

  // ✅ Handle date selection
  const onDateChange = (event, date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && date) {
      setSelectedDate(date);
      // Apply filter immediately on Android
      if (Platform.OS === "android") {
        filterByDate(date);
      }
    }

    // If user cancels on Android
    if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  // For iOS, we need a confirm button
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
      <Text style={styles.content}>
        {formatText(truncateText(item.goodThings, 1000))}
      </Text>

      {item.badThings && (
        <View style={styles.challengesSection}>
          <Text style={styles.challengesLabel}>Challenges:</Text>
          <Text style={styles.challengesText}>
            {formatText(truncateText(item.badThings, 1000))}
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
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* ✅ Header */}
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

            {/* Show Clear button only when filter is active */}
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
        <Text style={styles.headerSubtext}>
          {filteredDiaries.length}{" "}
          {filteredDiaries.length === 1 ? "entry" : "entries"}
          {isFilterActive && " (filtered)"}
        </Text>
      </View>

      {/* 📅 Beautiful Date Filter Section */}

      {/* 🎨 Date Picker - Works on both iOS and Android */}
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
    // marginBottom: 4,
  },
  headerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 28,
  },

  // 🎨 Date Filter Styles
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

  // 🎨 Date Picker Styles
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
});

export default MyDiariesScreen;
