import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles';

interface TabBarProps {
  activeSection: string;
  onSwitchSection: (section: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeSection, onSwitchSection }) => {
    const selectSection = (section: string) => {
        return section === 'calculator' ? 'calculate' : section;
    }
  return (
    <View style={styles.tabBar}>
      {['calculator', 'history', 'settings'].map((section) => (
        <TouchableOpacity
          key={section}
          style={[styles.tab, activeSection === section && styles.activeTab]}
          onPress={() => onSwitchSection(section)}
        >
          <MaterialIcons
            name={selectSection(section)}
            size={24}
            color={activeSection === section ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeSection === section && styles.activeTabText]}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};