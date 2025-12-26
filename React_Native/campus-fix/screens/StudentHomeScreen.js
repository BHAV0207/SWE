import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  ImageBackground
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';
import { Colors } from '../constants/theme';
import IssueCard from '../components/IssueCard';

const StudentHomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, total: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/issues/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        const open = data.filter(i => i.status === 'Open').length;
        const inProgress = data.filter(i => i.status === 'In Progress').length;
        const resolved = data.filter(i => i.status === 'Resolved').length;
        
        setStats({
          open,
          inProgress,
          resolved,
          total: data.length
        });

        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentIssues(sorted.slice(0, 3));
      }
    } catch (error) {
      console.log('fetch stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.light.primary, '#EC4899']} // Orange to Pink
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statNumber, { color: Colors.light.error }]}>{stats.open}</Text>
            <Text style={[styles.statLabel, { color: Colors.light.error }]}>Open</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.inProgress}</Text>
            <Text style={[styles.statLabel, { color: '#D97706' }]}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#CCFBF1' }]}>
            <Text style={[styles.statNumber, { color: Colors.light.secondary }]}>{stats.resolved}</Text>
            <Text style={[styles.statLabel, { color: Colors.light.secondary }]}>Resolved</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dashboard</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CreateIssue')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.light.primary, '#F59E0B']} // Orange to Amber
            style={styles.actionGradient}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle-outline" size={32} color="#fff" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Report New Issue</Text>
              <Text style={styles.actionDesc}>Submit a maintenance request</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyIssues')}
          activeOpacity={0.9}
        >
          <View style={styles.secondaryAction}>
            <View style={[styles.actionIcon, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="list-outline" size={32} color={Colors.light.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: Colors.light.text }]}>View My Issues</Text>
              <Text style={styles.actionDesc}>Track status of {stats.total} reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        {recentIssues.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -40, // Pull up over header
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)', // or gray for secondary
  },
  recentSection: {
    marginTop: 10,
  },
});

export default StudentHomeScreen;
