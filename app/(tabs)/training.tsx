import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { addActivity, getRecentActivities, Activity, resetDatabase, updateActivity, deleteActivity } from '@/services/database';

export default function TrainingScreen() {
  const [exerciseName, setExerciseName] = useState('');
  const [calories, setCalories] = useState('');
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = () => {
    const activities = getRecentActivities(10);
    setRecentActivities(activities);
  };

  const handleAddExercise = () => {
    if (!exerciseName || !calories) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      activity: exerciseName,
      calories: parseInt(calories),
      type: 'burned',
      timestamp: Date.now()
    };

    addActivity(newActivity);
    setExerciseName('');
    setCalories('');
    loadRecentActivities();
  };

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditName(activity.activity);
    setEditCalories(activity.calories.toString());
    setModalVisible(true);
  };

  const handleUpdateActivity = () => {
    if (!selectedActivity || !editName || !editCalories) return;

    const updatedActivity: Activity = {
      ...selectedActivity,
      activity: editName,
      calories: parseInt(editCalories),
    };

    updateActivity(updatedActivity);
    setModalVisible(false);
    loadRecentActivities();
  };

  const handleDeleteActivity = () => {
    if (!selectedActivity) return;

    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteActivity(selectedActivity.id);
            setModalVisible(false);
            loadRecentActivities();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Exercise name"
          placeholderTextColor="#999"
          value={exerciseName}
          onChangeText={setExerciseName}
        />
        <TextInput
          style={styles.input}
          placeholder="Calories burned"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
          <Text style={styles.buttonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recent Exercises</Text>
        <FlatList
          data={recentActivities.filter(activity => activity.type === 'burned')}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => handleActivityPress(item)}
            >
              <Text style={styles.exerciseName}>{item.activity}</Text>
              <Text style={styles.calories}>{item.calories} kcal</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Exercise</Text>
            <TextInput
              style={styles.input}
              placeholder="Exercise name"
              placeholderTextColor="#999"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={editCalories}
              onChangeText={setEditCalories}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteActivity}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdateActivity}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  inputContainer: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 8,
    color: '#fff',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#76c7c0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
  },
  listTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
  },
  calories: {
    color: '#76c7c0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: '#76c7c0',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  cancelButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
});
