import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../theme";

const BookmarksScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);

  const getBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem("bookmarks");
      if (data) {
        setBookmarks(JSON.parse(data));
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.log("Error loading:", err);
      setBookmarks([]);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", getBookmarks);
    return unsubscribe;
  }, [navigation]);

  const removeBookmark = async (url) => {
    try {
      const data = await AsyncStorage.getItem("bookmarks");
      if (!data) return;

      const list = JSON.parse(data);
      const nextList = list.filter((item) => item.url !== url);

      await AsyncStorage.setItem("bookmarks", JSON.stringify(nextList));
      setBookmarks(nextList);
    } catch (err) {
      console.log("Error removing:", err);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      "Remove saved article",
      "This article will be removed from your list.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeBookmark(item.url),
        },
      ]
    );
  };

  const openArticle = (item) => {
    navigation.navigate("NewsWebView", { url: item.url, title: item.title });
  };

  const renderBookmark = ({ item }) => (
    <TouchableOpacity
      style={styles.bookmarkCard}
      onPress={() => openArticle(item)}
      activeOpacity={0.8}
    >
      <View style={styles.bookmarkTextBlock}>
        <Text style={styles.bookmarkTitle} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.bookmarkDate}>
          Saved on {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerEyebrow}>Saved articles</Text>
        <Text style={styles.headerTitle}>Reading queue</Text>
      </View>

      <View style={{ width: 60 }} />
    </View>
  );

  if (bookmarks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <Header />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySubtext}>
              Tap on “Save” while reading any story to keep it here for later.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Header />
        <FlatList
          data={bookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item, index) => index.toString()}
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  bookmarkCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: colors.radiusMd,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bookmarkTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  bookmarkDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlay,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default BookmarksScreen;
