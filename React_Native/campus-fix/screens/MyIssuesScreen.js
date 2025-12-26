import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import IssueCard from '../components/IssueCard';
import API_URL from '../config/api';
import { Colors } from '../constants/theme';

const MyIssuesScreen = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
  const statuses = ['Open', 'In Progress', 'Resolved'];

  useEffect(() => {
    fetchIssues();
  }, [selectedCategory, selectedStatus]);

  const fetchIssues = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      let url = `${API_URL}/issues/my`;
      const params = [];
      
      if (selectedCategory) {
        params.push(`category=${selectedCategory}`);
      }
      if (selectedStatus) {
        params.push(`status=${selectedStatus}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setIssues(data);
      }
    } catch (error) {
      console.log('fetch issues error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
  };

  const FilterChip = ({ label, selected, onPress, color }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected && { backgroundColor: color, borderColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterText,
        selected && styles.filterTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.light.primary, '#EC4899']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Issues</Text>
      </LinearGradient>

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filters</Text>
          {(selectedCategory || selectedStatus) && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statuses}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <FilterChip
                label={item}
                selected={selectedStatus === item}
                onPress={() => setSelectedStatus(selectedStatus === item ? '' : item)}
                color={Colors.light.secondary}
              />
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        <View style={styles.filterRow}>
           <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <FilterChip
                label={item}
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(selectedCategory === item ? '' : item)}
                color={Colors.light.primary}
              />
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <IssueCard issue={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyText}>
                No issues found.
              </Text>
              <Text style={styles.emptySubtext}>
                Run into a problem? Create a new report.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 60 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: '600',
  },
  filterRow: {
    marginBottom: 10,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default MyIssuesScreen;
