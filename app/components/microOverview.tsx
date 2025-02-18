
import { View, Text, StyleSheet } from 'react-native';


export default function MicroOverview() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Micro Nutrient Overview</Text>
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