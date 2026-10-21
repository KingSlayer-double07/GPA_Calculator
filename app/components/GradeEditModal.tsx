import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { GradeScale } from '../types';
import { parseGradePoints } from '../utils/gradeScale';
import { styles } from '../styles';

interface GradeEditModalProps {
  visible: boolean;
  grade: GradeScale | null;
  onSave: (points: number) => void;
  onCancel: () => void;
}

const GradeEditForm: React.FC<{
  grade: GradeScale;
  onSave: (points: number) => void;
  onCancel: () => void;
}> = ({ grade, onSave, onCancel }) => {
  // The draft is local until Save, so typing never changes (or closes) anything.
  const [draft, setDraft] = useState(String(grade.points));
  const parsed = parseGradePoints(draft);
  const error = 'error' in parsed && draft.trim() !== '' ? parsed.error : null;

  const save = () => {
    if ('value' in parsed) onSave(parsed.value);
  };

  return (
    <>
      <Text style={styles.modalTitle} accessibilityRole="header">Edit Grade Scale</Text>
      <Text style={styles.modalGrade}>{grade.grade}</Text>
      <TextInput
        style={[styles.modalInput, error ? styles.inputError : null]}
        keyboardType="decimal-pad"
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={save}
        placeholder="Enter points"
        accessibilityLabel={`Points for grade ${grade.grade}`}
        autoFocus
        selectTextOnFocus
      />
      {error && <Text style={[styles.fieldError, styles.modalError]}>{error}</Text>}
      <View style={styles.dialogActions}>
        <TouchableOpacity style={[styles.dialogButton, styles.dialogCancel]} onPress={onCancel}>
          <Text style={styles.dialogCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dialogButton, styles.dialogPrimary, !('value' in parsed) && styles.disabledButton]}
          onPress={save}
          disabled={!('value' in parsed)}
        >
          <Text style={styles.dialogButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export const GradeEditModal: React.FC<GradeEditModalProps> = ({ visible, grade, onSave, onCancel }) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent} accessibilityViewIsModal>
        {/* Mounted only while editing, so every open starts from the grade's current points. */}
        {grade && <GradeEditForm key={grade.grade} grade={grade} onSave={onSave} onCancel={onCancel} />}
      </View>
    </View>
  </Modal>
);
