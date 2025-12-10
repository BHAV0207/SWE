import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Constants from "expo-constants";
import colors from "../theme";

const screenHeight = Dimensions.get("window").height;

const NewsFeedScreen = ({ navigation, route }) => {
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const city = route.params?.city || "New York";

  const getNews = async () => {
    setIsLoading(true);
    const apiKey = Constants.expoConfig?.extra?.gnewsApiKey || "";

    try {
      const result = await axios.get(
        `https://gnews.io/api/v4/search?q=${city}&lang=en&max=20&apikey=${apiKey}`
      );

      if (result.data && Array.isArray(result.data.articles)) {
        const articles = result.data.articles.map((a) => ({
          title: a.title || "No title",
          description: a.description || "No description available",
          urlToImage: a.image || null,
          url: a.url || "https://example.com",
          publishedAt: a.publishedAt || new Date().toISOString(),
        }));
        setNewsList(articles);
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.log("Error fetching news:", err);
      setNewsList([]);
    }

    setIsLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    getNews();
  }, [city]);

  const onRefresh = () => {
    setRefreshing(true);
    getNews();
  };

  const openArticle = (item) => {
    navigation.navigate("NewsWebView", { url: item.url, title: item.title });
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => openArticle(item)}
      activeOpacity={0.9}
    >
      {item.urlToImage ? (
        <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.newsDescription} numberOfLines={4}>
          {item.description}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>
            {new Date(item.publishedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.readHint}>Tap to open story →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primarySoft} />
          <Text style={styles.loadingText}>Fetching the latest for you…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEyebrow}>Today in</Text>
            <View style={styles.cityChip}>
              <Text style={styles.cityChipText}>{city}</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => navigation.navigate("EmergencyAlerts")}
            >
              <Text style={styles.alertButtonText}>Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => navigation.navigate("Bookmarks")}
            >
              <Text style={styles.bookmarkButtonText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>

        {newsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No stories available</Text>
            <Text style={styles.emptySubtext}>
              We couldn’t load news for {city}. Try refreshing or pick another
              city from the home screen.
            </Text>
          </View>
        ) : (
          <FlatList
            data={newsList}
            renderItem={renderNewsItem}
            keyExtractor={(_, index) => index.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: colors.textSecondary,
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
  headerLeft: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cityChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  cityChipText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  headerButtons: {
    flexDirection: "row",
    columnGap: 8,
  },
  alertButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: colors.radiusSm,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: "#fee2e2",
  },
  alertButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  bookmarkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: colors.radiusSm,
    backgroundColor: colors.secondary,
  },
  bookmarkButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20,
  },
  newsCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: colors.radiusLg,
    overflow: "hidden",
    minHeight: screenHeight * 0.45,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newsImage: {
    width: "100%",
    height: 220,
    backgroundColor: colors.overlay,
  },
  placeholderImage: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  newsContent: {
    padding: 16,
    flex: 1,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    flexShrink: 1,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  newsDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  readHint: {
    fontSize: 12,
    color: colors.secondarySoft,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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

export default NewsFeedScreen;
