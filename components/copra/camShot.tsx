import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CamShot() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
            <Text style={styles.title}>LIVE VIEW NG PUGON</Text>

           <TouchableOpacity style={styles.refreshBtn} onPress={() => console.log("refresh")} activeOpacity={0.7}>
              <Ionicons name="refresh" size={16} color="#4A3728" />
           </TouchableOpacity>
            
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={require("@/assets/images/Copra_Drying.jpg")}
            style={styles.image}
          />

          <Text style={styles.overlayText}>2:01PM • 10mins ago</Text>
        </View>
         
        <Text style={styles.subtitle}>Auto-update: 10 min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f0e3",
    marginBottom: 10,
  },

  content: {
    padding: 3,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A3728",
  },

  imageWrapper: {
    position: "relative",
    alignSelf: "center",
  },

  image: {
    width: 385,
    height: 200,
    borderRadius: 10,
    borderColor: "#4A3728",
    borderWidth: 2,
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

  subtitle: {
    fontSize: 12,
    color: "#4A3728",
    opacity: 0.7,
    marginTop: 8,
    alignSelf: "flex-start",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
},

  refreshBtn: {
    backgroundColor: '#F3EFEA', 
    padding: 8,
    borderRadius: 20,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
},
});