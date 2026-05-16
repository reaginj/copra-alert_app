import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Batch,
  BatchStatus,
  MoistureCondition,
  QualityGrade,
  statusColors,
} from '@/components/copra/WarehouseBatchCard';

type QualityCheckModalProps = {
  visible: boolean;
  batch: Batch | null;
  actualWeight: string;
  moistureCondition: MoistureCondition;
  qualityGrade: QualityGrade;
  moistureOptions: MoistureCondition[];
  qualityGrades: QualityGrade[];
  onActualWeightChange: (value: string) => void;
  onMoistureConditionChange: (value: MoistureCondition) => void;
  onQualityGradeChange: (value: QualityGrade) => void;
  onCompleteQualityCheck: (status: Extract<BatchStatus, 'Added to Inventory' | 'Rejected'>) => void;
  onClose: () => void;
};

export default function QualityCheckModal({
  visible,
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
  onClose,
}: QualityCheckModalProps) {
  if (!batch) {
    return null;
  }

  const statusColor = statusColors[batch.status];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.qualityIconBox}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#1E8A3A" />
            </View>

            <View style={styles.titleBox}>
              <Text style={styles.modalTitle}>Quality Check Details</Text>
              <Text style={styles.modalSubtitle}>{batch.batchId}</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} activeOpacity={0.75} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color="#4A3728" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <View style={styles.detailPanel}>
              <DetailRow label="Batch ID" value={batch.batchId} />
              <DetailRow label="Farmer Source" value={batch.farmName} />
              <DetailRow label="Quantity" value={batch.declaredWeight} />
              <DetailRow label="Delivery Date" value={batch.deliveryDate ?? 'Pending'} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{batch.status}</Text>
                </View>
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
              <TouchableOpacity
                style={styles.acceptButton}
                activeOpacity={0.85}
                onPress={() => onCompleteQualityCheck('Added to Inventory')}
              >
                <Text style={styles.acceptText}>Accept Batch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                activeOpacity={0.85}
                onPress={() => onCompleteQualityCheck('Rejected')}
              >
                <Text style={styles.rejectText}>Reject Batch</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    maxHeight: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalHeader: {
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
  titleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A3728',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#74665A',
    marginTop: 2,
    fontWeight: '700',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F0E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingBottom: 4,
  },
  detailPanel: {
    backgroundColor: '#F8F0E3',
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#66594E',
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#4A3728',
    fontWeight: '800',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 13,
    color: '#4A3728',
    fontWeight: '800',
    marginTop: 12,
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
    marginTop: 16,
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
  cancelButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8F0E3',
  },
  cancelText: {
    color: '#4A3728',
    fontSize: 13,
    fontWeight: '800',
  },
});
