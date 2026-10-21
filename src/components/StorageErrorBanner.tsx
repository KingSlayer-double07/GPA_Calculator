import React from 'react';
import { View } from 'react-native';
import { useAppData } from '../context/AppDataContext';
import { InlineMessage } from './InlineMessage';
import { styles } from '../styles';

/** Shows a message at the top of a screen when saved data could not be read or written. */
export const StorageErrorBanner: React.FC = () => {
  const { storageError, dismissStorageError } = useAppData();
  if (!storageError) return null;
  return (
    <View style={styles.bannerSlot}>
      <InlineMessage message={storageError} onDismiss={dismissStorageError} />
    </View>
  );
};
