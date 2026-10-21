import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { Course, GradeScale } from '../types';
import { ValidationErrors, formatGpa } from '../utils/calculator';
import { InlineMessage } from './InlineMessage';
import { colors } from '../theme';
import { styles } from '../styles';

interface CalculatorSectionProps {
  gpaName: string;
  onChangeName: (name: string) => void;
  courses: Course[];
  onChangeCourse: (id: string, changes: Partial<Omit<Course, 'id'>>) => void;
  gpa: number | null;
  gradeScale: GradeScale[];
  errors: ValidationErrors;
  showErrors: boolean;
  calculateDisabled: boolean;
  onAddCourse: () => void;
  onRemoveCourse: (id: string) => void;
  onCalculate: () => void;
}

/** Placeholders are not labels, so each input gets a label that also carries its current error. */
const labelWithError = (label: string, error?: string) => (error ? `${label}. ${error}` : label);

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  gpaName,
  onChangeName,
  courses,
  onChangeCourse,
  gpa,
  gradeScale,
  errors,
  showErrors,
  calculateDisabled,
  onAddCourse,
  onRemoveCourse,
  onCalculate,
}) => {
  // The letters a user can enter are whatever the grade scale defines.
  const validGrades = gradeScale.map((g) => g.grade.toUpperCase());

  return (
    <View style={styles.section}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">GPA Calculator</Text>
          <Text style={styles.subtitle}>Calculate your Grade Point Average</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.hintText}>Grades: {validGrades.join(', ')}</Text>

          <View style={styles.nameField}>
            <TextInput
              style={[styles.nameInput, showErrors && errors.name ? styles.inputError : null]}
              placeholder="Name this calculation (e.g. 100 level first semester)"
              accessibilityLabel={labelWithError('Name of this calculation', showErrors ? errors.name : undefined)}
              value={gpaName}
              onChangeText={onChangeName}
              placeholderTextColor={colors.placeholder}
            />
            {showErrors && errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
          </View>

          {courses.map((course, index) => {
            const courseErrors = errors.courses[index] ?? {};
            return (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseNumber}>Course {index + 1}</Text>
                  {courses.length > 1 && (
                    <TouchableOpacity
                      onPress={() => onRemoveCourse(course.id)}
                      style={styles.deleteButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove course ${index + 1}`}
                      hitSlop={12}
                    >
                      <Icon name="remove-circle" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.courseField}>
                  <TextInput
                    placeholder="Course Name (e.g. GES 101)"
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={labelWithError(`Course ${index + 1} name`, showErrors ? courseErrors.name : undefined)}
                    value={course.name}
                    onChangeText={(name) => onChangeCourse(course.id, { name })}
                    style={[styles.courseInput, showErrors && courseErrors.name ? styles.inputError : null]}
                  />
                  {showErrors && courseErrors.name && <Text style={styles.fieldError}>{courseErrors.name}</Text>}
                </View>

                <View style={styles.courseDetails}>
                  <View style={styles.smallField}>
                    <TextInput
                      placeholder="Units (e.g. 3)"
                      placeholderTextColor={colors.placeholder}
                      accessibilityLabel={labelWithError(`Course ${index + 1} units`, showErrors ? courseErrors.credit : undefined)}
                      keyboardType="numeric"
                      value={course.credit}
                      onChangeText={(credit) => onChangeCourse(course.id, { credit })}
                      style={[styles.courseInput, showErrors && courseErrors.credit ? styles.inputError : null]}
                    />
                    {showErrors && courseErrors.credit && <Text style={styles.fieldError}>{courseErrors.credit}</Text>}
                  </View>

                  <View style={styles.smallField}>
                    <TextInput
                      placeholder="Grade (e.g. A)"
                      placeholderTextColor={colors.placeholder}
                      accessibilityLabel={labelWithError(`Course ${index + 1} grade`, showErrors ? courseErrors.grade : undefined)}
                      value={course.grade}
                      onChangeText={(text) => {
                        // Take the newest character so typing over an existing letter replaces it,
                        // and ignore keystrokes that are not a grade in the scale.
                        const letter = text.trim().slice(-1).toUpperCase();
                        if (letter === '' || validGrades.includes(letter)) {
                          onChangeCourse(course.id, { grade: letter });
                        }
                      }}
                      style={[styles.courseInput, showErrors && courseErrors.grade ? styles.inputError : null]}
                      autoCapitalize="characters"
                    />
                    {showErrors && courseErrors.grade && <Text style={styles.fieldError}>{courseErrors.grade}</Text>}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addButton} onPress={onAddCourse} accessibilityRole="button">
            <Icon name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Add Course</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.calculateButton, calculateDisabled && styles.disabledButton]}
            onPress={onCalculate}
            disabled={calculateDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: calculateDisabled }}
          >
            <Icon name="calculate" size={24} color="white" />
            <Text style={styles.buttonText}>Calculate GPA</Text>
          </TouchableOpacity>
        </View>

        {showErrors && errors.count > 0 && (
          <View style={styles.formError}>
            <InlineMessage
              message={`Fix ${errors.count} highlighted ${errors.count === 1 ? 'field' : 'fields'} above to calculate your GPA.`}
            />
          </View>
        )}

        {/* Always rendered: a live region has to exist before its content appears to be announced. */}
        <View accessibilityLiveRegion="polite">
          {gpa !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Your GPA</Text>
              <Text style={styles.resultValue}>{formatGpa(gpa)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
