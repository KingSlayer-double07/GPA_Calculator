import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { styles } from '../styles';

/**
 * Root view of a tab screen. Tab screens stay mounted (so typed input survives switching tabs), and on web
 * the navigator leaves the inactive ones rendered underneath the active one. Left alone, their inputs stay
 * in the keyboard tab order and in the screen-reader tree, so inactive screens are removed from layout.
 */
export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  return (
    <View style={[styles.container, !focused && styles.hidden]} aria-hidden={!focused}>
      {children}
    </View>
  );
};
