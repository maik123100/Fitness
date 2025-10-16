import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SetTarget } from '@/types/types';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SetTargetInputListProps {
  setTargets: SetTarget[];
  onChange: (setTargets: SetTarget[]) => void;
}

const SetTargetInputList: React.FC<SetTargetInputListProps> = ({ setTargets, onChange }) => {
  const initialSameForAll = setTargets.length > 0 && setTargets.every(set => set.reps === setTargets[0].reps && set.weight === setTargets[0].weight);
  const initialSingleReps = initialSameForAll ? setTargets[0].reps.toString() : '10';
  const initialSingleWeight = initialSameForAll ? setTargets[0].weight.toString() : '0';
  const initialSetAmount = initialSameForAll ? setTargets.length.toString() : '3';

  const [sameForAll, setSameForAll] = useState(initialSameForAll);
  const [singleReps, setSingleReps] = useState(initialSingleReps);
  const [singleWeight, setSingleWeight] = useState(initialSingleWeight);
  const [setAmount, setSetAmount] = useState(initialSetAmount);

  const generateSetTargets = (reps: string, weight: string, amount: string): SetTarget[] => {
    const numSets = parseInt(amount) || 0;
    const parsedReps = parseFloat(reps) || 0;
    const parsedWeight = parseFloat(weight) || 0;
    const newSetTargets: SetTarget[] = [];
    for (let i = 0; i < numSets; i++) {
      newSetTargets.push({ reps: parsedReps, weight: parsedWeight });
    }
    return newSetTargets;
  };

  const handleSetAmountChange = (text: string) => {
    setSetAmount(text);
    if (sameForAll) {
      onChange(generateSetTargets(singleReps, singleWeight, text));
    }
  };

  const handleSingleRepsChange = (text: string) => {
    setSingleReps(text);
    if (sameForAll) {
      onChange(generateSetTargets(text, singleWeight, setAmount));
    }
  };

  const handleSingleWeightChange = (text: string) => {
    setSingleWeight(text);
    if (sameForAll) {
      onChange(generateSetTargets(singleReps, text, setAmount));
    }
  };

  const handleSameForAllToggle = (value: boolean) => {
    setSameForAll(value);
    if (value) {
      onChange(generateSetTargets(singleReps, singleWeight, setAmount));
    } else {
      // When switching back to individual sets, if there are no sets, provide a default
      if (setTargets.length === 0) {
        onChange([{ reps: 10, weight: 0 }]);
      }
    }
  };

  const addSet = () => {
    onChange([...setTargets, { reps: 10, weight: 0 }]); // Default new set to 10 reps, 0 weight
  };

  const removeSet = (index: number) => {
    const newSetTargets = setTargets.filter((_, i) => i !== index);
    onChange(newSetTargets);
  };

  const updateSet = (value: string, index: number, field: 'reps' | 'weight') => {
    const newSetTargets = [...setTargets];
    newSetTargets[index] = {
      ...newSetTargets[index],
      [field]: parseFloat(value) || 0, // Parse as float, default to 0 if invalid
    };
    onChange(newSetTargets);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Same Reps & Weight for all Sets</Text>
        <Switch
          trackColor={{ false: draculaTheme.comment, true: draculaTheme.green }}
          thumbColor={sameForAll ? draculaTheme.cyan : draculaTheme.foreground}
          onValueChange={handleSameForAllToggle}
          value={sameForAll}
        />
      </View>

      {sameForAll ? (
        <View>
          <Text style={styles.label}>Number of Sets</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={setAmount}
            onChangeText={handleSetAmountChange}
          />
          <View style={styles.singleInputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor={draculaTheme.comment}
                keyboardType="numeric"
                value={singleReps}
                onChangeText={handleSingleRepsChange}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                placeholderTextColor={draculaTheme.comment}
                keyboardType="numeric"
                value={singleWeight}
                onChangeText={handleSingleWeightChange}
              />
            </View>
          </View>
        </View>
      ) : (
        <>
          {setTargets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setLabel}>Set {index + 1}:</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputGroupLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(text) => updateSet(text, index, 'reps')}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputGroupLabel}>Weight</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(text) => updateSet(text, index, 'weight')}
                />
              </View>
              <TouchableOpacity onPress={() => removeSet(index)} style={styles.removeButton}>
                <Ionicons name="remove-circle" size={24} color={draculaTheme.red} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addSet} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={draculaTheme.green} />
            <Text style={styles.addButtonText}>Add Set</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginRight: spacing.sm,
    width: 50, // Fixed width for alignment
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    width: '100%', // Make input fill its parent inputGroup
    textAlign: 'center',
  },
  inputGroup: {
    flex: 1,
    marginRight: spacing.sm, // Space between input groups
    alignItems: 'center',
  },
  inputGroupLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  removeButton: {
    padding: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  addButtonText: {
    color: draculaTheme.green,
    fontSize: typography.sizes.md,
    marginLeft: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  toggleLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  singleInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
});

export default SetTargetInputList;
