import { StyleSheet, Text } from 'react-native';

import WarehouseBatchCard, { Batch } from '@/components/copra/WarehouseBatchCard';

type WarehouseBatchSectionProps = {
  title: string;
  batches: Batch[];
  onReceiveBatch: (batchId: string) => void;
  onOpenQualityCheck: (batch: Batch) => void;
};

export default function WarehouseBatchSection({
  title,
  batches,
  onReceiveBatch,
  onOpenQualityCheck,
}: WarehouseBatchSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>

      {batches.map((batch) => (
        <WarehouseBatchCard
          key={batch.batchId}
          batch={batch}
          onReceiveBatch={onReceiveBatch}
          onOpenQualityCheck={onOpenQualityCheck}
        />
      ))}
    </>
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
});
