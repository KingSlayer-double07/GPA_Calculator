import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { styles } from '../styles';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Alert.alert() is a no-op on react-native-web, so confirmations use a Modal that works everywhere.
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent} accessibilityViewIsModal>
        <Text style={styles.modalTitle} accessibilityRole="header">{title}</Text>
        <Text style={styles.confirmMessage}>{message}</Text>
        <View style={styles.confirmActions}>
          <TouchableOpacity
            style={[styles.confirmButton, styles.confirmCancel]}
            onPress={onCancel}
            disabled={busy}
          >
            <Text style={styles.confirmCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              destructive ? styles.confirmDestructive : styles.confirmPrimary,
              busy && styles.disabledButton,
            ]}
            onPress={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
