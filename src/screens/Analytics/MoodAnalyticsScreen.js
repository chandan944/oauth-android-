import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { getMyDiaries } from '../../services/diaryService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, MOOD_COLORS, MOOD_EMOJIS } from '../../utils/colors';
import { formatDate } from '../../utils/helpers';

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
      console.error('Error loading diaries:', error);
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

  // Calculate mood distribution
  const moodCounts = diaries.reduce((acc, diary) => {
    acc[diary.mood] = (acc[diary.mood] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(moodCounts).map((mood) => ({
    name: mood,
    population: moodCounts[mood],
    color: MOOD_COLORS[mood],
    legendFontColor: COLORS.text,
    legendFontSize: 14,
  }));

  // Prepare line chart data (last 7 days)
  const last7Days = diaries.slice(0, 7).reverse();
  const lineData = {
    labels: last7Days.map((d) => formatDate(d.entryDate).slice(0, 5)),
    datasets: [
      {
        data: last7Days.map((d) => {
          const moodValues = { HAPPY: 5, OKAY: 3, SAD: 1, ANGRY: 2, TIRED: 2 };
          return moodValues[d.mood] || 3;
        }),
      },
    ],
  };

  const totalEntries = diaries.length;
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.summaryCard}>
        <Text style={styles.emoji}>{MOOD_EMOJIS[dominantMood?.[0]]}</Text>
        <Text style={styles.summaryTitle}>Your Dominant Mood</Text>
        <Text style={styles.summaryValue}>{dominantMood?.[0]}</Text>
        <Text style={styles.summarySubtitle}>
          Based on {totalEntries} diary entries
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mood Distribution</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={styles.noData}>Not enough data yet</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mood Trend (Last 7 Days)</Text>
        {last7Days.length > 0 ? (
          <LineChart
            data={lineData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.primaryLight + '20',
              backgroundGradientTo: COLORS.primary + '20',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Not enough data yet</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mood Breakdown</Text>
        {Object.entries(moodCounts).map(([mood, count]) => (
          <View key={mood} style={styles.moodItem}>
            <View style={styles.moodInfo}>
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
              <Text style={styles.moodName}>{mood}</Text>
            </View>
            <View style={styles.moodStats}>
              <View
                style={[
                  styles.moodBar,
                  {
                    width: `${(count / totalEntries) * 100}%`,
                    backgroundColor: MOOD_COLORS[mood],
                  },
                ]}
              />
              <Text style={styles.moodCount}>{count} entries</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    margin: 16,
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    color: COLORS.grey,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    color: COLORS.grey,
    fontSize: 14,
    paddingVertical: 32,
  },
  moodItem: {
    marginBottom: 16,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  moodStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBar: {
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  moodCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default MoodAnalyticsScreen;