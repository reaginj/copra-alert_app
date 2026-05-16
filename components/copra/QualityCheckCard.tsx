import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Batch, BatchStatus, MoistureCondition, QualityGrade } from '@/components/copra/WarehouseBatchCard';

type QualityCheckCardProps = {
  batch: Batch;
  actualWeight: string;
  moistureCondition: MoistureCondition;
  qualityGrade: QualityGrade;
  moistureOptions: MoistureCondition[];
  qualityGrades: QualityGrade[];
  onActualWeightChange: (value: string) => void;
  onMoistureConditionChange: (value: MoistureCondition) => void;
  onQualityGradeChange: (value: QualityGrade) => void;
  onCompleteQualityCheck: (status: Extract<BatchStatus, 'Added to Inventory' | 'Rejected'>) => void;
};

export default function QualityCheckCard({
  batch,
  actualWeight,
  moistureCondition,
  qualityGrade,
  moistureOptions,
  qualityGrades,
  onActualWeightChange,
  onMoistureConditionChange,
  onQualityGradeChange,
  onCompleteQualityCheck,
}: QualityCheckCardProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>QUALITY CHECK DETAILS</Text>

      <View style={styles.qualityCard}>
        <View style={styles.qualityHeader}>
          <View style={styles.qualityIconBox}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#1E8A3A" />
          </View>

          <View style={styles.qualityTitleBox}>
            <Text style={styles.qualityBatch}>{batch.batchId}</Text>
            <Text style={styles.qualitySubtitle}>{batch.farmName}</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Actual Received Weight</Text>
        <TextInput
          style={styles.weightInput}
          value={actualWeight}
          onChangeText={onActualWeightChange}
          placeholder="Enter actual weight"
          keyboardType="decimal-pad"
        />

        <Text style={styles.inputLabel}>Moisture Condition</Text>
        <View style={styles.optionGrid}>
          {moistureOptions.map((option) => (
            <OptionButton
              key={option}
              label={option}
              active={moistureCondition === option}
              onPress={() => onMoistureConditionChange(option)}
            />
          ))}
        </View>

        <Text style={styles.inputLabel}>Quality Grade</Text>
        <View style={styles.optionGrid}>
          {qualityGrades.map((option) => (
            <OptionButton
              key={option}
              label={option}
              active={qualityGrade === option}
              onPress={() => onQualityGradeChange(option)}
            />
          ))}
        </View>

        <View style={styles.qualityActions}>
          <TouchableOpacity style={styles.acceptButton} activeOpacity={0.85} onPress={() => onCompleteQualityCheck('Added to Inventory')}>
            <Text style={styles.acceptText}>Accept Batch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} activeOpacity={0.85} onPress={() => onCompleteQualityCheck('Rejected')}>
            <Text style={styles.rejectText}>Reject Batch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function OptionButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionButton, active && styles.activeOptionButton]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.optionText, active && styles.activeOptionText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    color: '#4A3728',
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },
  qualityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qualityTitleBox: {
    flex: 1,
  },
  qualityBatch: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A3728',
  },
  qualitySubtitle: {
    fontSize: 13,
    color: '#74665A',
    marginTop: 2,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    color: '#4A3728',
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 7,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#D7CEC2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#4A3728',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: '#D7CEC2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  activeOptionButton: {
    borderColor: '#1E8A3A',
    backgroundColor: '#E8F3EA',
  },
  optionText: {
    color: '#66594E',
    fontSize: 12,
    fontWeight: '800',
  },
  activeOptionText: {
    color: '#1E8A3A',
  },
  qualityActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#1E8A3A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#A43A2F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectText: {
    color: '#A43A2F',
    fontSize: 13,
    fontWeight: '800',
  },
});
