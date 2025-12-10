import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../theme";

const NewsWebViewScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { url, title } = route.params;

  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const savedItems = await AsyncStorage.getItem("bookmarks");
      if (!savedItems) return;

      const list = JSON.parse(savedItems);
      const found = list.some((item) => item.url === url);
      setSaved(found);
    } catch (err) {
      console.log("Error checking bookmarks:", err);
    }
  };

  const toggleBookmark = async () => {
    try {
      const savedItems = await AsyncStorage.getItem("bookmarks");
      let list = savedItems ? JSON.parse(savedItems) : [];

      if (saved) {
        list = list.filter((item) => item.url !== url);
        setSaved(false);
      } else {
        list.push({
          title,
          url,
          date: new Date().toISOString(),
        });
        setSaved(true);
      }

      await AsyncStorage.setItem("bookmarks", JSON.stringify(list));
    } catch (err) {
      console.log("Error saving bookmark:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookmarkButton, saved && styles.bookmarkedButton]}
            onPress={toggleBookmark}
          >
            <Text style={styles.bookmarkButtonText}>
              {saved ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading article…</Text>
          </View>
        )}

        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 18,
    color: colors.textPrimary,
    marginRight: 4,
  },
  backText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  bookmarkButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: colors.radiusSm,
    backgroundColor: colors.secondary,
  },
  bookmarkedButton: {
    backgroundColor: colors.success,
  },
  bookmarkButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  loadingOverlay: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default NewsWebViewScreen;
