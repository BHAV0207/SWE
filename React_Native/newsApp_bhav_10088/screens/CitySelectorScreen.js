import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import popularCitiesData from "../data/popularCities.json";
import colors from "../theme";

const CitySelectorScreen = ({ navigation }) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [inputValue, setInputValue] = useState("");

  const cities = popularCitiesData;

  const selectCity = (city) => {
    setSelectedCity(city);
    setInputValue("");
  };

  const onInputChange = (text) => {
    setInputValue(text);
    setSelectedCity(text);
  };

  const goToNews = () => {
    if (selectedCity.trim()) {
      navigation.navigate("NewsFeed", { city: selectedCity.trim() });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Local Brief</Text>
          <Text style={styles.title}>Where do you stay?</Text>
          <Text style={styles.subtitle}>
            Choose your city to see headlines, alerts and updates that actually
            matter to you.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Type a city</Text>
          <TextInput
            style={styles.cityInput}
            placeholder="e.g. Mumbai, Bengaluru, London"
            placeholderTextColor={colors.textMuted}
            value={inputValue}
            onChangeText={onInputChange}
            autoCapitalize="words"
          />
        </View>

        <Text style={styles.popularLabel}>Quick picks</Text>
        <ScrollView
          style={styles.cityList}
          contentContainerStyle={styles.cityListContent}
        >
          {cities.map((city, index) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cityButton,
                  isSelected && styles.selectedCityButton,
                ]}
                onPress={() => selectCity(city)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.cityText,
                    isSelected && styles.selectedCityText,
                  ]}
                >
                  {city}
                </Text>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCity.trim() && styles.disabledButton,
          ]}
          onPress={goToNews}
          disabled={!selectedCity.trim()}
        >
          <Text style={styles.continueButtonText}>View my city feed</Text>
        </TouchableOpacity>
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
    padding: 18,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: colors.radiusLg,
    padding: colors.spacing,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  cityInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: colors.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  popularLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 4,
  },
  cityList: {
    flex: 1,
  },
  cityListContent: {
    paddingBottom: 10,
  },
  cityButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: colors.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedCityButton: {
    borderColor: colors.primary,
    backgroundColor: "#eff6ff",
  },
  cityText: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  selectedCityText: {
    color: colors.primary,
    fontWeight: "700",
  },
  checkMark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: colors.radiusLg,
    marginTop: 12,
    marginBottom: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default CitySelectorScreen;
