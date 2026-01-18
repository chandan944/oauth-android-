import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { G, Circle as SvgCircle, Path } from "react-native-svg";
import { LineChart } from "react-native-chart-kit";
import { getMyDiaries } from "../../services/diaryService";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLORS, MOOD_COLORS, MOOD_EMOJIS } from "../../utils/colors";
import { formatDate } from "../../utils/helpers";

const { width } = Dimensions.get("window");

const PieChart = ({ data }) => {
  const size = 200;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = -90;

  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;

    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    currentAngle += angle;

    return {
      path: pathData,
      color: item.color,
      percentage: Math.round(percentage * 100),
    };
  });

  return (
    <View style={styles.pieContainer}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <Path key={index} d={slice.path} fill={slice.color} />
          ))}
        </G>
      </Svg>
    </View>
  );
};

const MoodAnalyticsScreen = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = async () => {
    try {
      const response = await getMyDiaries(0, 100);
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

  if (loading) return <LoadingSpinner />;

  const moodCounts = diaries.reduce((acc, diary) => {
    acc[diary.mood] = (acc[diary.mood] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(moodCounts).map((mood) => ({
    name: mood,
    value: moodCounts[mood],
    color: MOOD_COLORS[mood] || "#9E9E9E",
  }));

  // Prepare chart data with proper date formatting
  const getShortDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${month.slice(0, 3)}`;
  };

  const last7Days = diaries.slice(0, 7).reverse();
  const lineData = {
    labels:
      last7Days.length > 0
        ? last7Days.map((d) => getShortDate(d.entryDate))
        : [""],
    datasets: [
      {
        data:
          last7Days.length > 0
            ? last7Days.map((d) => {
                const moodValues = {
                  HAPPY: 5,
                  OKAY: 3,
                  SAD: 1,
                  ANGRY: 2,
                  TIRED: 2,
                };
                return moodValues[d.mood] || 3;
              })
            : [0], // Fallback to prevent chart errors
        strokeWidth: 3,
      },
    ],
  };

  const totalEntries = diaries.length;
  const dominantMood = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGradient}>
          <Text style={styles.heroEmoji}>
            {MOOD_EMOJIS[dominantMood?.[0]] || "😊"}
          </Text>
          <Text style={styles.heroTitle}>Your Mood Journey</Text>
          <Text style={styles.heroSubtitle}>
            {totalEntries} entries tracked
          </Text>
          {dominantMood && (
            <View style={styles.dominantBadge}>
              <Text style={styles.dominantText}>
                Most Common: {dominantMood[0]}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Mood Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="book" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="calendar" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{last7Days.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="star" size={24} color="#FFA726" />
          </View>
          <Text style={styles.statValue}>{moodCounts["HAPPY"] || 0}</Text>
          <Text style={styles.statLabel}>Happy Days</Text>
        </View>
      </View>

      {/* Mood Distribution */}
      {pieData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Mood Distribution</Text>
          <View style={styles.pieChartContainer}>
            <PieChart data={pieData} />
          </View>

          <View style={styles.legend}>
            {sortedMoods.map(([mood, count]) => (
              <View key={mood} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: MOOD_COLORS[mood] || "#9E9E9E" },
                    ]}
                  />
                  <Text style={styles.legendEmoji}>{MOOD_EMOJIS[mood]}</Text>
                  <Text style={styles.legendLabel}>{mood}</Text>
                </View>
                <Text style={styles.legendValue}>
                  {Math.round((count / totalEntries) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Mood Trend */}
      {last7Days.length > 1 && (
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>7-Day Mood Trend</Text>
          <Text style={styles.chartSubtitle}>
            Your emotional journey over the past week
          </Text>
          <LineChart
            data={lineData}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#6C5CE7",
                fill: "#ffffff",
              },
              propsForBackgroundLines: {
                stroke: "#e0e0e0",
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.lineChart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            segments={4}
            fromZero={true}
          />
        </Card>
      )}
      {/* Mood Breakdown Bars */}
      <Card style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
        {sortedMoods.map(([mood, count]) => {
          const percentage = (count / totalEntries) * 100;
          return (
            <View key={mood} style={styles.moodBarItem}>
              <View style={styles.moodBarHeader}>
                <View style={styles.moodBarLeft}>
                  <Text style={styles.moodBarEmoji}>{MOOD_EMOJIS[mood]}</Text>
                  <Text style={styles.moodBarLabel}>{mood}</Text>
                </View>
                <Text style={styles.moodBarCount}>{count} entries</Text>
              </View>
              <View style={styles.moodBarContainer}>
                <View
                  style={[
                    styles.moodBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: MOOD_COLORS[mood] || "#9E9E9E",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.moodBarPercentage,
                  { color: MOOD_COLORS[mood] || "#9E9E9E" },
                ]}
              >
                {Math.round(percentage)}%
              </Text>
            </View>
          );
        })}
      </Card>

      {/* Insights Card */}
      <Card style={styles.insightsCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb" size={24} color="#FFA726" />
          <Text style={styles.insightTitle}>Insights</Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.insightText}>
            You've been consistent with journaling!
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="trending-up" size={20} color="#2196F3" />
          <Text style={styles.insightText}>
            {dominantMood?.[0] || "Happy"} mood appears most frequently
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar" size={20} color="#9C27B0" />
          <Text style={styles.insightText}>
            {totalEntries} total reflections recorded
          </Text>
        </View>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  heroCard: {
    marginBottom: 8,
    borderRadius: 0,
    overflow: "hidden",
  },
  heroGradient: {
    backgroundColor: "#6C5CE7",
    padding: 40,
    alignItems: "center",
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  dominantBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dominantText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#636E72",
    textAlign: "center",
  },

  chartCard: {
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },

  chartSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },

  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -16,
  },
  pieChartContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  pieContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendEmoji: {
    fontSize: 20,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  legendValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6C5CE7",
  },

  moodScale: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  scaleItem: {
    alignItems: "center",
  },
  scaleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  scaleLabel: {
    fontSize: 11,
    color: "#636E72",
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
  },
  moodBarItem: {
    marginBottom: 20,
  },
  moodBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  moodBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moodBarEmoji: {
    fontSize: 20,
  },
  moodBarLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
  },
  moodBarCount: {
    fontSize: 13,
    color: "#636E72",
  },
  moodBarContainer: {
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
  },
  moodBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  moodBarPercentage: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  insightsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#FFF9E6",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },

  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -20, // Negative margin to offset card padding
    overflow: "hidden",
  },
});

export default MoodAnalyticsScreen;
