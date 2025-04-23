import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Course } from '../types';
import { styles } from '../styles';

interface CalculatorSectionProps {
  gpaName: string;
  setGpaName: (name: string) => void;
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  gpa: number | null;
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
  isCalculating,
  onAddCourse,
  onRemoveCourse,
  onCalculate,
  resultAnim,
  scaleAnim,
}) => {
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
          <TextInput 
            style={styles.nameInput}
            placeholder="Name this calculation (e.g. 100 level first semester)" 
            value={gpaName} 
            onChangeText={setGpaName}
            placeholderTextColor="#666" 
          />

          {courses.map((course, index) => (
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
              
              <TextInput
                placeholder="Course Name (e.g. GES 101)"
                value={course.name}
                onChangeText={(text) => {
                  const newCourses = [...courses];
                  newCourses[index].name = text;
                  setCourses(newCourses);
                }}
                style={styles.courseInput}
              />
              
              <View style={styles.courseDetails}>
                <TextInput
                  placeholder="Units (e.g. 3)"
                  keyboardType="numeric"
                  value={course.credit}
                  onChangeText={(text) => {
                    const newCourses = [...courses];
                    newCourses[index].credit = text;
                    setCourses(newCourses);
                  }}
                  style={[styles.courseInput, styles.smallInput]}
                />
                
                <TextInput
                  placeholder="Grade (e.g. A)"
                  value={course.grade}
                  onChangeText={(text) => {
                    const validGrades = ['A', 'B', 'C', 'D', 'F'];
                    const formattedText = text.toUpperCase();
                    if (validGrades.includes(formattedText) || formattedText === '') {
                      const newCourses = [...courses];
                      newCourses[index].grade = text.toUpperCase();
                      setCourses(newCourses);
                    }
                  }}
                  style={[styles.courseInput, styles.smallInput]}
                  maxLength={1}
                  autoCapitalize="characters"
                />
              </View>
            </Animated.View>
          ))}
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