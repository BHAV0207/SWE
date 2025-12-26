import React from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { Colors } from '../constants/theme';
import API_URL from '../config/api';

const IssueCard = ({ issue }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return Colors.light.error; // Red
      case 'In Progress':
        return '#F59E0B'; // Amber-500
      case 'Resolved':
        return Colors.light.secondary; // Emerald
      default:
        return Colors.light.text;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Open':
        return '#FEE2E2'; // Red-100
      case 'In Progress':
        return '#FEF3C7'; // Amber-100
      case 'Resolved':
        return '#D1FAE5'; // Emerald-100
      default:
        return '#F1F5F9';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      {issue.image && (
        <Image
          source={{ uri: `${API_URL}/issues/image/${issue.image}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(issue.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
              {issue.status}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(issue.createdAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {issue.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {issue.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.category}>{issue.category}</Text>
        </View>

        {issue.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Admin Remarks</Text>
            <Text style={styles.remarks} numberOfLines={2}>
              {issue.remarks}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4, // Android shadow
    overflow: 'hidden',
    borderWidth: 0,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    backgroundColor: '#F3E8FF', // Violet-100
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  remarksContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.secondary,
  },
  remarksLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  remarks: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});

export default IssueCard;
