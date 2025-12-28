import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { COLORS, MOOD_COLORS } from '../../utils/colors';

const MoodPieChart = ({ moodData }) => {
  if (!moodData || moodData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No mood data available yet</Text>
      </View>
    );
  }

  const chartData = moodData.map((item) => ({
    name: item.mood,
    population: item.count,
    color: MOOD_COLORS[item.mood] || COLORS.grey,
    legendFontColor: COLORS.text,
    legendFontSize: 14,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Distribution</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 64}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={styles.legend}>
        {moodData.map((item) => (
          <View key={item.mood} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: MOOD_COLORS[item.mood] },
              ]}
            />
            <Text style={styles.legendText}>
              {item.mood}: {item.count}
            </Text>
          </View>
        ))}
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
});

export default MoodPieChart;