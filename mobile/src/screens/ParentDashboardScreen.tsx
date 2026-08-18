import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchParentDashboard, ParentDashboardResponse } from '../services/api';

export const ParentDashboardScreen: React.FC = () => {
  const [data, setData] = useState<ParentDashboardResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetchParentDashboard('usr-parent-001');
    setData(res);
  };

  if (!data || !data.children[0]) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Parent Analytics...</Text>
      </View>
    );
  }

  const child = data.children[0];

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>🐱</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.childName}>{child.first_name}'s Learning Journey</Text>
          <Text style={styles.subtitle}>Grade {child.grade_level} • Age {child.age}</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{child.weekly_stats.videos_watched}</Text>
          <Text style={styles.metricLabel}>Videos Explored</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{child.weekly_stats.accuracy_percentage}%</Text>
          <Text style={styles.metricLabel}>Quiz Accuracy</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{child.weekly_stats.concepts_mastered}</Text>
          <Text style={styles.metricLabel}>Mastered</Text>
        </View>
      </View>

      {/* Concept Progress Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Graph Breakdown</Text>
        {child.concept_progress.map((cp, idx) => (
          <View key={idx} style={styles.conceptItem}>
            <View>
              <Text style={styles.conceptTitleText}>{cp.concept_title}</Text>
              <Text style={styles.conceptTopicText}>{cp.topic}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              cp.status === 'MASTERED' ? styles.badgeMastered : styles.badgeDeveloping
            ]}>
              <Text style={styles.statusText}>{cp.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Conversation Starters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 AI Parent-Child Conversation Starters</Text>
        {child.conversation_starters.map((cs, idx) => (
          <View key={idx} style={styles.promptCard}>
            <Text style={styles.promptText}>{cs.prompt}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
    paddingTop: 44,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0E14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  titleGroup: {
    flex: 1,
  },
  childName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#161B26',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metricVal: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#161B26',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  conceptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  conceptTitleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  conceptTopicText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMastered: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeDeveloping: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  promptCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  promptText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
  },
});
