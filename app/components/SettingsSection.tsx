import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GradeScale } from '../types';
import { GradeEditModal } from './GradeEditModal';
import { styles } from '../styles';

interface SettingsSectionProps {
  gradeScale: GradeScale[];
  showGradeScaleModal: boolean;
  editingGrade: GradeScale | null;
  onEditGrade: (grade: GradeScale) => void;
  onUpdateGrade: (updatedGrade: GradeScale) => void;
  onResetGradeScale: () => void;
  onCloseModal: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  gradeScale,
  showGradeScaleModal,
  editingGrade,
  onEditGrade,
  onUpdateGrade,
  onResetGradeScale,
  onCloseModal,
}) => {
  return (
    <Animated.View 
      style={[
        styles.section,
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your grading scale</Text>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Grade Scale</Text>
            <TouchableOpacity 
              onPress={onResetGradeScale}
              style={styles.resetButton}
            >
              <MaterialIcons name="refresh" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {gradeScale.map((grade, index) => (
            <View key={index} style={styles.gradeScaleItem}>
              <View style={styles.gradeScaleInfo}>
                <Text style={styles.gradeText}>{grade.grade}</Text>
                <Text style={styles.pointsText}>{grade.points} {grade.points === 1 ? 'point' : 'points'}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => onEditGrade(grade)}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <GradeEditModal
        visible={showGradeScaleModal}
        grade={editingGrade}
        onSave={(points) => editingGrade && onUpdateGrade({ ...editingGrade, points })}
        onCancel={onCloseModal}
      />
    </Animated.View>
  );
}; 