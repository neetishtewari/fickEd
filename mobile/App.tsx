import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, StatusBar } from 'react-native';
import { ChildFeedScreen } from './src/screens/ChildFeedScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';
import { ParentPinModal } from './src/components/ParentPinModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'child' | 'parent'>('child');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);

  const handleParentTabPress = () => {
    if (isParentUnlocked) {
      setCurrentTab('parent');
    } else {
      setPinModalVisible(true);
    }
  };

  const handlePinSuccess = () => {
    setIsParentUnlocked(true);
    setPinModalVisible(false);
    setCurrentTab('parent');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
      
      {/* Active Screen */}
      <View style={styles.screenContainer}>
        {currentTab === 'child' ? <ChildFeedScreen /> : <ParentDashboardScreen />}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, currentTab === 'child' && styles.tabBtnActive]}
          onPress={() => setCurrentTab('child')}
        >
          <Text style={[styles.tabText, currentTab === 'child' && styles.tabTextActive]}>
            📺 Child Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, currentTab === 'parent' && styles.tabBtnActive]}
          onPress={handleParentTabPress}
        >
          <Text style={[styles.tabText, currentTab === 'parent' && styles.tabTextActive]}>
            🔒 Parent Portal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Parent PIN Security Modal */}
      <ParentPinModal
        visible={pinModalVisible}
        onSuccess={handlePinSuccess}
        onCancel={() => setPinModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#161B26',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
