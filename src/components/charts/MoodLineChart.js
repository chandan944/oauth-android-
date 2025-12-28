import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../utils/colors';
import { formatDate } from '../../utils/helpers';

const MoodLineChart = ({ moodHistory }) => {
  if (!moodHistory || moodHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No mood history available yet</Text>
      </View>
    );
  }

  // Convert mood to numeric values for chart
  const moodValues = {
    HAPPY: 5,
    OKAY: 3,
    SAD: 1,
    ANGRY: 2,
    TIRED: 2,
  };

  const chartData = {
    labels: moodHistory.map((item) => formatDate(item.date).slice(0, 5)),
    datasets: [
      {
        data: moodHistory.map((item) => moodValues[item.mood] || 3),
        color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.primaryLight + '20',
    backgroundGradientTo: COLORS.primary + '20',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Trend Over Time</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 64}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero
      />
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <Text style={styles.legendLabel}>5 = Very Happy</Text>
          <Text style={styles.legendLabel}>3 = Neutral</Text>
          <Text style={styles.legendLabel}>1 = Very Sad</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  legend: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  legendLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});

export default MoodLineChart;
