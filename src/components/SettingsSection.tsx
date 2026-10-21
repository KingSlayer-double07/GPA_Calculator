import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { GradeScale } from '../types';
import { GradeEditModal } from './GradeEditModal';
import { styles } from '../styles';

interface SettingsSectionProps {
  gradeScale: GradeScale[];
  /** The grade whose points are being edited; the editor is open while this is set. */
  editingGrade: GradeScale | null;
  onEditGrade: (grade: GradeScale) => void;
  onSaveGrade: (points: number) => void;
  onCancelEdit: () => void;
  onResetGradeScale: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  gradeScale,
  editingGrade,
  onEditGrade,
  onSaveGrade,
  onCancelEdit,
  onResetGradeScale,
}) => {
  return (
    <View style={styles.section}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">Settings</Text>
          <Text style={styles.subtitle}>Customize your grading scale</Text>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Grade Scale</Text>
            <TouchableOpacity onPress={onResetGradeScale} style={styles.resetButton}>
              <Icon name="refresh" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {gradeScale.map((grade) => (
            <View key={grade.grade} style={styles.gradeScaleItem}>
              <View style={styles.gradeScaleInfo}>
                <Text style={styles.gradeText}>{grade.grade}</Text>
                <Text style={styles.pointsText}>{grade.points} {grade.points === 1 ? 'point' : 'points'}</Text>
              </View>
              <TouchableOpacity onPress={() => onEditGrade(grade)} style={styles.editButton}>
                <Icon name="edit" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <GradeEditModal
        visible={editingGrade !== null}
        grade={editingGrade}
        onSave={onSaveGrade}
        onCancel={onCancelEdit}
      />
    </View>
  );
};
