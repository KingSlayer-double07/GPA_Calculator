import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HistoryItem } from '../types';
import { styles } from '../styles';

interface HistorySectionProps {
  history: HistoryItem[];
  isLoadingHistory: boolean;
  isSaving: boolean;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  isLoadingHistory,
  isSaving,
  onClearHistory,
}) => {
  return (
    <Animated.View 
      style={[
        styles.section,
      ]}
    >
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity 
              onPress={onClearHistory}
              style={styles.clearHistoryButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#E63946" size="small" />
              ) : (
                <MaterialIcons name="delete-outline" size={24} color="#E63946" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Animated.View 
                style={[
                  styles.historyCard,
                ]}
              >
                <View>
                  <Text style={styles.historyName}>{item.name}</Text>
                  <Text style={styles.historyDate}>Calculated on {new Date().toLocaleDateString()}</Text>
                </View>
                <Text style={styles.historyGPA}>{item.gpa}</Text>
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyListContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No calculations yet</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}; 