import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Course, GradeScale } from '../types';
import { ValidationErrors } from '../utils/calculator';
import { InlineMessage } from './InlineMessage';
import { styles } from '../styles';

interface CalculatorSectionProps {
  gpaName: string;
  setGpaName: (name: string) => void;
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  gpa: number | null;
  gradeScale: GradeScale[];
  errors: ValidationErrors;
  showErrors: boolean;
  isCalculating: boolean;
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onCalculate: () => void;
  scaleAnim: Animated.Value;
  resultAnim: Animated.Value;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  gpaName,
  setGpaName,
  courses,
  setCourses,
  gpa,
  gradeScale,
  errors,
  showErrors,
  isCalculating,
  onAddCourse,
  onRemoveCourse,
  onCalculate,
  resultAnim,
  scaleAnim,
}) => {
  // The letters a user can enter are whatever the grade scale defines.
  const validGrades = gradeScale.map((g) => g.grade.toUpperCase());

  return (
    <Animated.View 
      style={[
        styles.section,
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>GPA Calculator</Text>
          <Text style={styles.subtitle}>Calculate your Grade Point Average</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.hintText}>Grades: {validGrades.join(', ')}</Text>

          <View style={styles.nameField}>
            <TextInput 
              style={[styles.nameInput, showErrors && errors.name ? styles.inputError : null]}
              placeholder="Name this calculation (e.g. 100 level first semester)" 
              value={gpaName} 
              onChangeText={setGpaName}
              placeholderTextColor="#666" 
            />
            {showErrors && errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
          </View>

          {courses.map((course, index) => {
            const courseErrors = errors.courses[index] ?? {};
            return (
            <Animated.View 
              key={index} 
              style={[
                styles.courseCard,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.courseHeader}>
                <Text style={styles.courseNumber}>Course {index + 1}</Text>
                {index > 0 && (
                  <TouchableOpacity 
                    onPress={() => onRemoveCourse(index)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="remove-circle" size={24} color="#E63946" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.courseField}>
                <TextInput
                  placeholder="Course Name (e.g. GES 101)"
                  value={course.name}
                  onChangeText={(text) => {
                    const newCourses = [...courses];
                    newCourses[index].name = text;
                    setCourses(newCourses);
                  }}
                  style={[styles.courseInput, showErrors && courseErrors.name ? styles.inputError : null]}
                />
                {showErrors && courseErrors.name && <Text style={styles.fieldError}>{courseErrors.name}</Text>}
              </View>
              
              <View style={styles.courseDetails}>
                <View style={styles.smallField}>
                  <TextInput
                    placeholder="Units (e.g. 3)"
                    keyboardType="numeric"
                    value={course.credit}
                    onChangeText={(text) => {
                      const newCourses = [...courses];
                      newCourses[index].credit = text;
                      setCourses(newCourses);
                    }}
                    style={[styles.courseInput, showErrors && courseErrors.credit ? styles.inputError : null]}
                  />
                  {showErrors && courseErrors.credit && <Text style={styles.fieldError}>{courseErrors.credit}</Text>}
                </View>
                
                <View style={styles.smallField}>
                  <TextInput
                    placeholder="Grade (e.g. A)"
                    value={course.grade}
                    onChangeText={(text) => {
                      // Take the newest character so typing over an existing letter replaces it,
                      // and ignore keystrokes that are not a grade in the scale.
                      const letter = text.trim().slice(-1).toUpperCase();
                      if (letter === '' || validGrades.includes(letter)) {
                        const newCourses = [...courses];
                        newCourses[index].grade = letter;
                        setCourses(newCourses);
                      }
                    }}
                    style={[styles.courseInput, showErrors && courseErrors.grade ? styles.inputError : null]}
                    autoCapitalize="characters"
                  />
                  {showErrors && courseErrors.grade && <Text style={styles.fieldError}>{courseErrors.grade}</Text>}
                </View>
              </View>
            </Animated.View>
            );
          })}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={onAddCourse}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Add Course</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.calculateButton, isCalculating && styles.disabledButton]} 
              onPress={onCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialIcons name="calculate" size={24} color="white" />
                  <Text style={styles.buttonText}>Calculate GPA</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {showErrors && errors.count > 0 && (
          <View style={styles.formError}>
            <InlineMessage
              message={`Fix ${errors.count} highlighted ${errors.count === 1 ? 'field' : 'fields'} above to calculate your GPA.`}
            />
          </View>
        )}

        {gpa !== null && (
          <Animated.View 
            style={[
              styles.resultCard,
              {/* GPA animation
                transform: [
                  { scale: resultAnim },
                  { translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })}
                ],
                opacity: resultAnim,
              */}
            ]}
          >
            <Text style={styles.resultLabel}>Your GPA</Text>
            <Text style={styles.resultValue}>{gpa}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );
}; 