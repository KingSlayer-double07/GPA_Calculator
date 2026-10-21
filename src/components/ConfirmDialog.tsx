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

// react-native-web puts extra Modal props on the dialog element, which is how it gets an accessible name.
// The React Native typings do not list aria-label for Modal, hence the cast.
const dialogName = (name: string) => ({ 'aria-label': name }) as object;

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
  <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} {...dialogName(title)}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent} accessibilityViewIsModal>
        <Text style={styles.modalTitle} accessibilityRole="header">{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogActions}>
          <TouchableOpacity
            style={[styles.dialogButton, styles.dialogCancel]}
            onPress={onCancel}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dialogButton,
              destructive ? styles.dialogDestructive : styles.dialogPrimary,
              busy && styles.disabledButton,
            ]}
            onPress={onConfirm}
            disabled={busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy, busy }}
          >
            {busy ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.dialogButtonText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
