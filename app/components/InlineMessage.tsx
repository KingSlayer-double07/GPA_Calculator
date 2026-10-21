import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles';

interface InlineMessageProps {
  message: string;
  onDismiss?: () => void;
}

/** An error banner that is rendered in the page, so it is visible on web where Alert is a no-op. */
export const InlineMessage: React.FC<InlineMessageProps> = ({ message, onDismiss }) => (
  <View style={styles.banner} accessibilityRole="alert">
    <MaterialIcons name="error-outline" size={20} color="#C62828" />
    <Text style={styles.bannerText}>{message}</Text>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss message">
        <MaterialIcons name="close" size={20} color="#C62828" />
      </TouchableOpacity>
    )}
  </View>
);
