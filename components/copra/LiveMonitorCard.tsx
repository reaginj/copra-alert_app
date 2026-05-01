import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCopra } from "./copraContext";

export default function LiveMonitorCard() {
  const { temp, lastUpdate } = useCopra();

  const getStatus = (temp: number) => {
    if (temp < 40) return { label: "Mababa", bg: "#EAF3F8", text: "#3F7FA8" };
    if (temp <= 60) return { label: "Normal", bg: "#EAF5EE", text: "#3E7D5B" };
    if (temp <= 75) return { label: "Babala", bg: "#FFF4D8", text: "#9A7418" };
    return { label: "Kritikal", bg: "#FCEDEA", text: "#B9382A" };
  };

  const status = getStatus(temp);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>LIVE VIEW NG PUGON</Text>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => console.log("refresh")}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color="#4A3728" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageWrapper}>
        <Image
          source={require("@/assets/images/Copra_Drying.jpg")}
          style={styles.image}
        />

        <Text style={styles.liveBadge}>LIVE</Text>
        <Text style={styles.overlayText}>2:01PM • 10mins ago</Text>
      </View>

      <View style={styles.tempRow}>
        <Text style={[styles.temp, { color: status.text }]}>
          {temp}
          <Text style={styles.degree}>°C</Text>
        </Text>
        

        <View style={[styles.statusCont, { backgroundColor: status.bg }]}>
          <View style={[styles.dotCircle, { backgroundColor: status.text }]} />
          <Text style={[styles.statusText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>

        <Text style={styles.update}>{lastUpdate}</Text>
      </View>

      <Text style={styles.subtitle}>Auto-update: 10 min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FBF7F1",
    borderRadius: 22,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d8c9b2",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A3728",
  },

  refreshBtn: {
    backgroundColor: "#FBF7F1",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },

  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    backgroundColor: "#B9382A",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  overlayText: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 12,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tempRow: {
    marginTop: 12,
    backgroundColor: "#FBF7F1",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  temp: {
    fontSize: 32,
    fontWeight: "700",
  },

  degree: {
    fontSize: 14,
    color: "#5A3E2B",
  },

  statusCont: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  dotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },

  update: {
    fontSize: 13,
    color: "#4A3728",
    opacity: 0.75,
  },

  subtitle: {
    fontSize: 12,
    color: "#4A3728",
    opacity: 0.7,
    marginTop: 8,
  },
});