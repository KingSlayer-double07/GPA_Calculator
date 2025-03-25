import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GradeScale } from '../types';
import { styles } from '../styles';

interface SettingsSectionProps {
  gradeScale: GradeScale[];
  showGradeScaleModal: boolean;
  editingGrade: GradeScale | null;
  onEditGrade: (grade: GradeScale) => void;
  onUpdateGrade: (updatedGrade: GradeScale) => void;
  onResetGradeScale: () => void;
  onCloseModal: () => void;
  fadeAnim: Animated.Value;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  gradeScale,
  showGradeScaleModal,
  editingGrade,
  onEditGrade,
  onUpdateGrade,
  onResetGradeScale,
  onCloseModal,
  fadeAnim,
}) => {
  return (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
        }
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
                <Text style={styles.pointsText}>{grade.points} points</Text>
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

      <Modal
        visible={showGradeScaleModal}
        transparent
        animationType="slide"
        onRequestClose={onCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Grade Scale</Text>
            {editingGrade && (
              <>
                <Text style={styles.modalGrade}>{editingGrade.grade}</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={""}
                  onChangeText={(text) => {
                    const points = parseInt(text) || 0;
                    onUpdateGrade({ ...editingGrade, points });
                  }}
                  placeholder="Enter points"
                />
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={onCloseModal}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}; 