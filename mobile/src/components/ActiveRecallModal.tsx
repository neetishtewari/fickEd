import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface ActiveRecallModalProps {
  visible: boolean;
  questionText: string;
  options: string[];
  explanation?: string;
  onSelectOption: (index: number) => void;
  onClose: () => void;
}

export const ActiveRecallModal: React.FC<ActiveRecallModalProps> = ({
  visible,
  questionText,
  options,
  explanation,
  onSelectOption,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePress = (idx: number) => {
    setSelectedIndex(idx);
    onSelectOption(idx);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Active Checkpoint</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.questionText}>{questionText}</Text>

          <View style={styles.optionsContainer}>
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  onPress={() => handlePress(idx)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedIndex !== null && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackTitle}>
                {selectedIndex === 0 ? '🎉 Correct! (+50 XP)' : 'Nice Try! (+10 XP)'}
              </Text>
              {explanation && <Text style={styles.explanationText}>{explanation}</Text>}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#161B26',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 20,
    fontWeight: '600',
  },
  questionText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionBtnSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#6366F1',
  },
  optionText: {
    color: '#F9FAFB',
    fontSize: 15,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#818CF8',
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  feedbackTitle: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  explanationText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginTop: 4,
  },
});
