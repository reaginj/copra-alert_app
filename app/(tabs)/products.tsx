import Header from '@/components/copra/Header';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Product() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Products"
          subtitle="Drying Results and Copra Output"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weight Measurement</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="scale-outline" size={60} color="#1E8A3A" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Kasalukuyang Timbang</Text>
              <Text style={styles.weight}>240 kg</Text>

              <View style={styles.updateRow}>
                <Ionicons name="time-outline" size={16} color="#333" />
                <Text style={styles.sub}>Huling Update: 9:30 AM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Output Computation</Text>

          <View style={styles.outputRow}>
            <View style={styles.outputBox}>
              <Text style={styles.labelOutput}>Total Output</Text>
              <Text style={styles.outputValue}>240 kg</Text>
            </View>

            <View style={styles.outputBox}>
              <Text style={styles.labelOutput}>Estimated Value</Text>
              <Text style={styles.outputValue}>₱14,520</Text>
            </View>
          </View>
        </View>

        <View style={styles.batchCard}>
          <Text style={styles.cardTitle}>Batch Recording</Text>

          <View style={styles.batchRow}>
            <View style={styles.batchIconBox}>
              <Ionicons name="clipboard-outline" size={55} color="#A66A00" />
            </View>

            <View style={styles.batchInfo}>
              <Text style={styles.batchLabel}>Batch ID</Text>
              <Text style={styles.batchNum}>COP-001</Text>
              <Text style={styles.date}>Started: May 23, 2026 10:00 AM</Text>

              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Status:</Text>

                <View style={styles.ongoingBadge}>
                  <Text style={styles.ongoingText}>Ongoing</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#A66A00" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>Production History</Text>

            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeader}>
            <View style={styles.colBatch}>
              <Text style={styles.tableHeadText}>Batch ID</Text>
            </View>

            <View style={styles.colDate}>
              <Text style={styles.tableHeadText}>Date</Text>
            </View>

            <View style={styles.colOutput}>
              <Text style={styles.tableHeadText}>Output</Text>
            </View>

            <View style={styles.colStatus}>
              <Text style={styles.tableHeadText}>Status</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colBatch}>
              <Text style={styles.tableText}>COP-001</Text>
            </View>

            <View style={styles.colDate}>
              <Text style={styles.tableText}>May 23</Text>
            </View>

            <View style={styles.colOutput}>
              <Text style={styles.tableText}>240 kg</Text>
            </View>

            <View style={styles.colStatus}>
              <View style={styles.ongoingBadge}>
                <Text style={styles.ongoingText}>Ongoing</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colBatch}>
              <Text style={styles.tableText}>COP-000</Text>
            </View>

            <View style={styles.colDate}>
              <Text style={styles.tableText}>May 15</Text>
            </View>

            <View style={styles.colOutput}>
              <Text style={styles.tableText}>245 kg</Text>
            </View>

            <View style={styles.colStatus}>
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>Done</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colBatch}>
              <Text style={styles.tableText}>COP-000</Text>
            </View>

            <View style={styles.colDate}>
              <Text style={styles.tableText}>May 10</Text>
            </View>

            <View style={styles.colOutput}>
              <Text style={styles.tableText}>238 kg</Text>
            </View>

            <View style={styles.colStatus}>
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>Done</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F4',
  },

  topSafeArea: {
    backgroundColor: '#4A3728',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: '#333333',
  },

  weight: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1E8A3A',
    marginTop: 4,
  },

  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },

  sub: {
    fontSize: 12,
    color: '#555555',
  },

  outputRow: {
    flexDirection: 'row',
    gap: 12,
  },

  outputBox: {
    flex: 1,
    minHeight: 105,
    borderRadius: 16,
    backgroundColor: '#EAF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },

  labelOutput: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },

  outputValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1E8A3A',
    textAlign: 'center',
  },

  batchCard: {
    backgroundColor: '#FFF6E8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3E0BE',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  batchIconBox: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#FFE7B8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  batchInfo: {
    flex: 1,
  },

  batchLabel: {
    fontSize: 13,
    color: '#333333',
  },

  batchNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7A4B00',
    marginTop: 3,
  },

  date: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  statusText: {
    fontSize: 13,
    color: '#333333',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E8A3A',
    marginBottom: 12,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    paddingVertical: 10,
    borderRadius: 10,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  colBatch: {
    width: '25%',
    alignItems: 'center',
  },

  colDate: {
    width: '22%',
    alignItems: 'center',
  },

  colOutput: {
    width: '23%',
    alignItems: 'center',
  },

  colStatus: {
    width: '30%',
    alignItems: 'center',
  },

  tableHeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },

  tableText: {
    fontSize: 12,
    color: '#222222',
    textAlign: 'center',
  },

  ongoingBadge: {
    backgroundColor: '#FFE3A8',
    width: 85,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },

  ongoingText: {
    color: '#9A6100',
    fontSize: 12,
    fontWeight: '700',
  },

  completeBadge: {
    backgroundColor: '#DDEFD8',
    width: 85,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },

  completeText: {
    color: '#1E6B32',
    fontSize: 12,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 30,
  },
});