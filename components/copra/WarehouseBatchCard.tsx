import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export type BatchStatus = 'In Transit' | 'Under Quality Check' | 'Added to Inventory' | 'Rejected';
export type QualityGrade = 'Pending' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type MoistureCondition = 'Pending' | 'Dry' | 'Slightly Moist' | 'Too Moist';

export type Batch = {
  farmName: string;
  batchId: string;
  declaredWeight: string;
  receivedWeight: string;
  location: string;
  deliveryDate?: string;
  status: BatchStatus;
  qualityGrade: QualityGrade;
  moistureCondition: MoistureCondition;
};

export const statusColors: Record<BatchStatus, string> = {
  'In Transit': '#1E8A3A',
  'Under Quality Check': '#B9770E',
  'Added to Inventory': '#2E7D32',
  Rejected: '#A43A2F',
};

type WarehouseBatchCardProps = {
  batch: Batch;
  onReceiveBatch: (batchId: string) => void;
  onOpenQualityCheck: (batch: Batch) => void;
};

export default function WarehouseBatchCard({
  batch,
  onReceiveBatch,
  onOpenQualityCheck,
}: WarehouseBatchCardProps) {
  const statusColor = statusColors[batch.status];

  return (
    <View style={styles.batchCard}>
      <View style={styles.batchTop}>
        <View style={styles.batchIcon}>
          <FontAwesome5 name="warehouse" size={22} color="#1E8A3A" />
        </View>

        <View style={styles.batchInfo}>
          <Text style={styles.farmName}>{batch.farmName}</Text>
          <Text style={styles.batchId}>{batch.batchId}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{batch.status}</Text>
      </View>

      <View style={styles.batchDetails}>
        <DetailRow icon="scale" label="Declared Weight" value={batch.declaredWeight} />
        <DetailRow icon="scale-balance" label="Received Weight" value={batch.receivedWeight} />
        <DetailRow icon="map-marker-outline" label="Location" value={batch.location} />

        {batch.status !== 'In Transit' && (
          <DetailRow icon="star-check-outline" label="Quality Grade" value={batch.qualityGrade} />
        )}

        {(batch.status === 'Added to Inventory' || batch.status === 'Rejected') && (
          <DetailRow icon="water-percent" label="Moisture Condition" value={batch.moistureCondition} />
        )}
      </View>

      {batch.status === 'In Transit' && (
        <View style={styles.batchActions}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => onReceiveBatch(batch.batchId)}>
            <Text style={styles.primaryText}>Receive Batch</Text>
          </TouchableOpacity>
        </View>
      )}

      {batch.status === 'Under Quality Check' && (
        <View style={styles.batchActions}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => onOpenQualityCheck(batch)}>
            <Text style={styles.primaryText}>Open Quality Check</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons name={icon} size={19} color="#1E8A3A" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  batchCard: {
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
  batchTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  batchInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A3728',
  },
  batchId: {
    fontSize: 13,
    color: '#827365',
    marginTop: 3,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  batchDetails: {
    backgroundColor: '#F8F0E3',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
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
    marginLeft: 8,
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#4A3728',
    fontWeight: '800',
    textAlign: 'right',
  },
  batchActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1E8A3A',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
