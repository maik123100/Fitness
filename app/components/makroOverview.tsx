
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

export type Makro = {
  protein: number;
  carbs: number;
  fat: number;
};

export type MakroOverviewProps = {
  targetMakro: Makro;
  currentMakro: Makro;
};

export default function MakroOverview({ targetMakro, currentMakro }: MakroOverviewProps) {
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    data: [
      currentMakro.protein / targetMakro.protein,
      currentMakro.carbs / targetMakro.carbs,
      currentMakro.fat / targetMakro.fat,
    ], 
  };
  
  const colors = ['rgba(255, 99, 132,', 'rgba(54, 162, 235,', 'rgba(255, 205, 86,'];
  const defaultColor = 'rgb(118, 199, 192)';
  const chartConfig = {
    backgroundColor: '#1f1f1f',
    backgroundGradientFrom: '#1f1f1f',
    backgroundGradientTo: '#1f1f1f',
    color: (opacity=1, index) => {
      if(colors[index] === undefined) {
        return defaultColor;
      }
      return `${colors[index]}${opacity})`;
    }, 
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Makro Overview</Text>
      <ProgressChart
        data={data}
        width={Dimensions.get('window').width - 80} // Adjusted width
        height={220}
        strokeWidth={16}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});