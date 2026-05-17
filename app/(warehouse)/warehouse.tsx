import { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/copra/Header';
import QualityCheckModal from '@/components/copra/QualityCheckModal';
import WarehouseActivityCard from '@/components/copra/WarehouseActivityCard';
import { Batch, BatchStatus, MoistureCondition, QualityGrade } from '@/components/copra/WarehouseBatchCard';
import WarehouseBatchSection from '@/components/copra/WarehouseBatchSection';
import WarehouseStatsGrid from '@/components/copra/WarehouseStatsGrid';

const initialBatches: Batch[] = [
  {
    farmName: 'Juan Dela Cruz Farm',
    batchId: 'BATCH-001',
    declaredWeight: '50 kg',
    receivedWeight: 'Pending',
    farmLocation: 'Quezon Province',
    deliveryDate: 'Pending',
    status: 'In Transit',
    qualityGrade: 'Pending',
    moistureCondition: 'Pending',
  },
  {
    farmName: 'Mendoza Coconut Farm',
    batchId: 'BATCH-002',
    declaredWeight: '75 kg',
    receivedWeight: '74.5 kg',
    farmLocation: 'Lucena City',
    deliveryDate: 'May 16, 2026',
    status: 'Under Review',
    qualityGrade: 'Pending',
    moistureCondition: 'Pending',
  },
  {
    farmName: 'Santos Farm',
    batchId: 'BATCH-003',
    declaredWeight: '45 kg',
    receivedWeight: '45 kg',
    farmLocation: 'Tayabas',
    deliveryDate: 'May 15, 2026',
    status: 'Accepted',
    qualityGrade: 'Good',
    moistureCondition: 'Dry',
  },
  {
    farmName: 'Rivera Farm',
    batchId: 'BATCH-004',
    declaredWeight: '40 kg',
    receivedWeight: '38.5 kg',
    farmLocation: 'Sariaya',
    deliveryDate: 'May 14, 2026',
    status: 'Rejected',
    qualityGrade: 'Poor',
    moistureCondition: 'Too Moist',
  },
];

const qualityGrades: QualityGrade[] = ['Excellent', 'Good', 'Fair', 'Poor'];
const moistureOptions: MoistureCondition[] = ['Dry', 'Slightly Moist', 'Too Moist'];

export default function WarehouseDashboard() {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isQualityModalVisible, setIsQualityModalVisible] = useState(false);
  const [actualWeight, setActualWeight] = useState('');
  const [moistureCondition, setMoistureCondition] = useState<MoistureCondition>('Dry');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Good');

  const inTransitBatches = batches.filter((batch) => batch.status === 'In Transit');
  const underReviewBatches = batches.filter((batch) => batch.status === 'Under Review');
  const completedBatches = batches.filter(
    (batch) => batch.status === 'Accepted' || batch.status === 'Rejected'
  );

  const stats = useMemo(() => {
    const inTransit = batches.filter((batch) => batch.status === 'In Transit').length;
    const underReview = batches.filter((batch) => batch.status === 'Under Review').length;
    const accepted = batches.filter((batch) => batch.status === 'Accepted').length;

    return {
      inTransit,
      underReview,
      accepted,
      inventory: '520 kg',
    };
  }, [batches]);

  const handleReceiveBatch = (batchId: string) => {
    setBatches((currentBatches) =>
      currentBatches.map((batch) =>
        batch.batchId === batchId
          ? {
              ...batch,
              status: 'Under Review',
              receivedWeight: 'Pending',
            }
          : batch
      )
    );
  };

  const handleOpenQualityCheck = (batch: Batch) => {
    setSelectedBatch(batch);
    setActualWeight(batch.receivedWeight === 'Pending' ? '' : batch.receivedWeight.replace(' kg', ''));
    setMoistureCondition(batch.moistureCondition === 'Pending' ? 'Dry' : batch.moistureCondition);
    setQualityGrade(batch.qualityGrade === 'Pending' ? 'Good' : batch.qualityGrade);
    setIsQualityModalVisible(true);
  };

  const closeQualityCheck = () => {
    setIsQualityModalVisible(false);
    setSelectedBatch(null);
    setActualWeight('');
    setMoistureCondition('Dry');
    setQualityGrade('Good');
  };

  const completeQualityCheck = (status: Extract<BatchStatus, 'Accepted' | 'Rejected'>) => {
    if (!selectedBatch) {
      return;
    }

    const cleanedWeight = actualWeight.trim();

    setBatches((currentBatches) =>
      currentBatches.map((batch) =>
        batch.batchId === selectedBatch.batchId
          ? {
              ...batch,
              status,
              receivedWeight: cleanedWeight ? `${cleanedWeight.replace(' kg', '')} kg` : batch.receivedWeight,
              moistureCondition,
              qualityGrade,
            }
          : batch
      )
    );

    closeQualityCheck();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Warehouse"
          subtitle="Copra Receiving & Quality Check"
          profileRoute="/(warehouse)/profile"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WarehouseStatsGrid stats={stats} />

        <WarehouseBatchSection
          title="IN TRANSIT COPRA BATCHES"
          batches={inTransitBatches}
          onReceiveBatch={handleReceiveBatch}
          onOpenQualityCheck={handleOpenQualityCheck}
        />

        <WarehouseBatchSection
          title="UNDER REVIEW"
          batches={underReviewBatches}
          onReceiveBatch={handleReceiveBatch}
          onOpenQualityCheck={handleOpenQualityCheck}
        />

        <WarehouseBatchSection
          title="WAREHOUSE RECORDS"
          batches={completedBatches}
          onReceiveBatch={handleReceiveBatch}
          onOpenQualityCheck={handleOpenQualityCheck}
        />

        <WarehouseActivityCard />
      </ScrollView>

      <QualityCheckModal
        visible={isQualityModalVisible}
        batch={selectedBatch}
        actualWeight={actualWeight}
        moistureCondition={moistureCondition}
        qualityGrade={qualityGrade}
        moistureOptions={moistureOptions}
        qualityGrades={qualityGrades}
        onActualWeightChange={setActualWeight}
        onMoistureConditionChange={setMoistureCondition}
        onQualityGradeChange={setQualityGrade}
        onCompleteQualityCheck={completeQualityCheck}
        onClose={closeQualityCheck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F0E3',
  },
  topSafeArea: {
    backgroundColor: '#4A3728',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
