import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../utils/colors';
import { formatDate } from '../../utils/helpers';

const HabitProgressChart = ({ habitLogs, title = 'Habit Progress' }) => {
  if (!habitLogs || habitLogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No habit logs available yet</Text>
      </View>
    );
  }

  // Sort by date and take last 7 days
  const sortedLogs = [...habitLogs]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const chartData = {
    labels: sortedLogs.map((log) => formatDate(log.date).slice(0, 5)),
    datasets: [
      {
        data: sortedLogs.map((log) => (log.status === 'completed' ? 1 : 0)),
        color: (opacity = 1) => `rgba(0, 210, 160, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: sortedLogs.map((log) => log.currentStreak || 0),
        color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Completion', 'Streak'],
  };

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.success + '10',
    backgroundGradientTo: COLORS.primary + '10',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 64}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
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
});

export default HabitProgressChart;