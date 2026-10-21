import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme';
import { styles } from '../styles';

interface InlineMessageProps {
  message: string;
  onDismiss?: () => void;
}

/** An error banner that is rendered in the page, so it is visible on web where Alert is a no-op. */
export const InlineMessage: React.FC<InlineMessageProps> = ({ message, onDismiss }) => (
  <View style={styles.banner} accessibilityRole="alert">
    <Icon name="error-outline" size={20} color={colors.error} />
    <Text style={styles.bannerText}>{message}</Text>
    {onDismiss && (
      <TouchableOpacity
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        hitSlop={12}
      >
        <Icon name="close" size={20} color={colors.error} />
      </TouchableOpacity>
    )}
  </View>
);
