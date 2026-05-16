import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const historyRows = [
  {
    batchId: 'COP-001',
    date: 'May 23',
    output: '240 kg',
    status: 'Ongoing',
  },
  {
    batchId: 'COP-000',
    date: 'May 15',
    output: '245 kg',
    status: 'Done',
  },
  {
    batchId: 'COP-000',
    date: 'May 10',
    output: '238 kg',
    status: 'Done',
  },
];

export default function ProductionHistoryCard() {
  return (
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

      {historyRows.map((row, index) => (
        <ProductionHistoryRow
          key={`${row.batchId}-${row.date}-${index}`}
          batchId={row.batchId}
          date={row.date}
          output={row.output}
          status={row.status}
        />
      ))}
    </View>
  );
}

function ProductionHistoryRow({
  batchId,
  date,
  output,
  status,
}: {
  batchId: string;
  date: string;
  output: string;
  status: string;
}) {
  const isOngoing = status === 'Ongoing';

  return (
    <View style={styles.tableRow}>
      <View style={styles.colBatch}>
        <Text style={styles.tableText}>{batchId}</Text>
      </View>

      <View style={styles.colDate}>
        <Text style={styles.tableText}>{date}</Text>
      </View>

      <View style={styles.colOutput}>
        <Text style={styles.tableText}>{output}</Text>
      </View>

      <View style={styles.colStatus}>
        <View style={isOngoing ? styles.ongoingBadge : styles.completeBadge}>
          <Text style={isOngoing ? styles.ongoingText : styles.completeText}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
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
});
