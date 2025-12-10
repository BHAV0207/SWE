import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import emergencyAlertsData from "../data/emergencyAlerts.json";
import colors from "../theme";

const EmergencyAlertsScreen = ({ navigation }) => {
  const [alerts] = useState(emergencyAlertsData);

  const getColor = (type) => {
    if (type === "high") return colors.danger;
    if (type === "medium") return colors.primary;
    return colors.secondary;
  };

  const renderAlert = ({ item }) => {
    const color = getColor(item.type);

    return (
      <View style={[styles.alertCard, { borderTopColor: color }]}>
        <View style={styles.alertHeader}>
          <View
            style={[
              styles.alertTypeBadge,
              { backgroundColor: `${color}15`, borderColor: color },
            ]}
          >
            <Text style={[styles.alertType, { color }]}>{item.type}</Text>
          </View>
          <Text style={styles.alertDate}>{item.date}</Text>
        </View>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>Safety centre</Text>
            <Text style={styles.headerTitle}>City alerts</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            These alerts highlight severe weather, infrastructure issues and
            other important local updates.
          </Text>
        </View>

        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: colors.radiusSm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  infoBox: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: colors.radiusMd,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  alertCard: {
    backgroundColor: colors.surface,
    marginBottom: 14,
    borderRadius: colors.radiusLg,
    padding: 16,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  alertTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  alertType: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  alertDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  alertDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default EmergencyAlertsScreen;
