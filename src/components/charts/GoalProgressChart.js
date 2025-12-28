import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart, LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../utils/colors';
import { formatDate } from '../../utils/helpers';

const GoalProgressChart = ({
  progressHistory,
  currentProgress = 0,
  title = 'Goal Progress',
  showTimeline = true,
}) => {
  if (!progressHistory || progressHistory.length === 0) {
    // Show circular progress even without history
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.circularContainer}>
          <ProgressChart
            data={{ data: [currentProgress / 100] }}
            width={200}
            height={200}
            strokeWidth={16}
            radius={80}
            chartConfig={{
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
            }}
            hideLegend={true}
          />
          <View style={styles.progressText}>
            <Text style={styles.progressValue}>{currentProgress}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>
      </View>
    );
  }

  // Sort by date and take last 7 days
  const sortedHistory = [...progressHistory]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const lineChartData = {
    labels: sortedHistory.map((item) => formatDate(item.date).slice(0, 5)),
    datasets: [
      {
        data: sortedHistory.map((item) => item.totalProgress || 0),
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Circular Progress */}
      <View style={styles.circularContainer}>
        <ProgressChart
          data={{ data: [currentProgress / 100] }}
          width={200}
          height={200}
          strokeWidth={16}
          radius={80}
          chartConfig={{
            backgroundGradientFrom: COLORS.white,
            backgroundGradientTo: COLORS.white,
            color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
          }}
          hideLegend={true}
        />
        <View style={styles.progressText}>
          <Text style={styles.progressValue}>{currentProgress}%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
      </View>

      {/* Timeline Chart */}
      {showTimeline && (
        <View style={styles.timelineContainer}>
          <Text style={styles.subtitle}>Progress Timeline</Text>
          <LineChart
            data={lineChartData}
            width={Dimensions.get('window').width - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero
          />
        </View>
      )}
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 24,
  },
  circularContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  timelineContainer: {
    width: '100%',
    alignItems: 'center',
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

export default GoalProgressChart;