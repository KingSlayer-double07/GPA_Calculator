import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';
import { HistoryItem } from '../types';
import { formatGpa } from '../utils/calculator';
import { describeHistoryItem } from '../utils/history';
import { styles } from '../styles';

interface HistorySectionProps {
  history: HistoryItem[];
  isLoadingHistory: boolean;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  isLoadingHistory,
  onClearHistory,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle} accessibilityRole="header">History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={onClearHistory} style={styles.clearHistoryButton}>
              <Icon name="delete-outline" size={24} color="#E63946" />
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const description = describeHistoryItem(item);
              return (
                <View style={styles.historyCard}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    {description !== '' && <Text style={styles.historyDate}>{description}</Text>}
                  </View>
                  <Text style={styles.historyGPA}>{formatGpa(item.gpa)}</Text>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyListContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="history" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No calculations yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};
