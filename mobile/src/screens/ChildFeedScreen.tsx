import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { fetchNextFeedItem, submitTelemetryEvent, FeedPayload } from '../services/api';
import { ActiveRecallModal } from '../components/ActiveRecallModal';

const { width } = Dimensions.get('window');

export const ChildFeedScreen: React.FC = () => {
  const [feedItem, setFeedItem] = useState<FeedPayload | null>(null);
  const [xp, setXp] = useState(250);
  const [streak, setStreak] = useState(4);
  const [quizVisible, setQuizVisible] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const data = await fetchNextFeedItem('child-agrima-001');
    setFeedItem(data);
  };

  const handleQuizSelect = async (optionIndex: number) => {
    if (!feedItem || !feedItem.questions[0]) return;
    const res = await submitTelemetryEvent(
      'child-agrima-001',
      'QUESTION_ANSWERED',
      feedItem.questions[0].id,
      optionIndex
    );
    setXp(res.new_total_xp);
    setStreak(res.streak_days);
  };

  if (!feedItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Learning Journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.logoGroup}>
          <Text style={styles.logoText}>Flick<Text style={styles.logoHighlight}>Ed</Text></Text>
        </View>
        <View style={styles.statsGroup}>
          <View style={[styles.badge, styles.xpBadge]}>
            <Text style={styles.xpText}>⚡ {xp} XP</Text>
          </View>
          <View style={[styles.badge, styles.streakBadge]}>
            <Text style={styles.streakText}>🔥 {streak} Days</Text>
          </View>
        </View>
      </View>

      {/* Concept Pill */}
      <View style={styles.conceptBar}>
        <View>
          <Text style={styles.subjectTag}>{feedItem.concept.topic}</Text>
          <Text style={styles.conceptTitle}>{feedItem.concept.title}</Text>
        </View>
        <Text style={styles.stepText}>Step {feedItem.step_index} of {feedItem.total_steps}</Text>
      </View>

      {/* Vertical Video Card */}
      <View style={styles.videoCard}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.videoTitleText}>{feedItem.video.title}</Text>
          <Text style={styles.creatorText}>By {feedItem.video.channel_name}</Text>
        </View>

        {/* Side Actions */}
        <View style={styles.actionColumn}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setQuizVisible(true)}>
            <View style={[styles.iconCircle, styles.quizGlow]}>
              <Text style={styles.actionIconText}>💡</Text>
            </View>
            <Text style={styles.actionLabel}>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={loadFeed}>
            <View style={[styles.iconCircle, styles.nextGlow]}>
              <Text style={styles.actionIconText}>↓</Text>
            </View>
            <Text style={styles.actionLabel}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Recall Modal */}
      {feedItem.questions[0] && (
        <ActiveRecallModal
          visible={quizVisible}
          questionText={feedItem.questions[0].question_text}
          options={feedItem.questions[0].options}
          explanation={feedItem.questions[0].explanation}
          onSelectOption={handleQuizSelect}
          onClose={() => setQuizVisible(false)}
        />
      )}
    </View>
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
    fontSize: 16,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoGroup: {},
  logoText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  logoHighlight: {
    color: '#06B6D4',
  },
  statsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  xpText: {
    color: '#818CF8',
    fontWeight: '700',
    fontSize: 13,
  },
  streakBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  streakText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
  },
  conceptBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161B26',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subjectTag: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  conceptTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  videoCard: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  playIcon: {
    fontSize: 48,
    color: '#6366F1',
    marginBottom: 12,
  },
  videoTitleText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  creatorText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  actionColumn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 16,
  },
  actionBtn: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizGlow: {
    backgroundColor: '#06B6D4',
  },
  nextGlow: {
    backgroundColor: '#6366F1',
  },
  actionIconText: {
    fontSize: 20,
    color: '#FFF',
  },
  actionLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
