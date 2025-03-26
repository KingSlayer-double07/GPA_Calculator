import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, Platform, StatusBar, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CalculatorSection } from './components/CalculatorSection';
import { HistorySection } from './components/HistorySection';
import { SettingsSection } from './components/SettingsSection';
import { Course, HistoryItem, GradeScale, ActiveSection } from './types';
import { DEFAULT_GRADE_SCALE } from './constants/gradeScale';
import { saveHistory, loadHistory, saveGradeScale, loadGradeScale } from './utils/storage';
import { calculateGPA } from './utils/calculator';
import { styles } from './styles';

export default function GPACalculator() {
  // State management
  const [courses, setCourses] = useState<Course[]>([{ name: '', credit: '', grade: '' }]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [gpaName, setGpaName] = useState('');
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(DEFAULT_GRADE_SCALE);
  const [activeSection, setActiveSection] = useState<ActiveSection>('calculator');
  const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeScale | null>(null);

  // Loading states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);
  const resultAnim = new Animated.Value(0);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setIsLoadingHistory(true);
    try {
      const [savedHistory, savedGradeScale] = await Promise.all([
        loadHistory(),
        loadGradeScale()
      ]);
      if (savedHistory) setHistory(savedHistory);
      if (savedGradeScale) setGradeScale(savedGradeScale);
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Course management functions
  const addCourse = () => {
    /*if (courses.length >= 10) {
      Alert.alert(
        'Maximum Courses Reached',
        'You can only add up to 10 courses at a time.',
        [{ text: 'OK' }]
      );
      return;
    }*/
    setCourses([...courses, { name: '', credit: '', grade: '' }]);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const removeCourse = (index: number) => {
    if (courses.length <= 1) {
      Alert.alert(
        'Cannot Remove Course',
        'You must have at least one course.',
        [{ text: 'OK' }]
      );
      return;
    }
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
  };

  // GPA calculation
  const handleCalculate = async () => {
    // Validate inputs before calculation
    if (!gpaName.trim()) {
      Alert.alert(
        'Missing Name',
        'Please enter a name for this GPA calculation.',
        [{ text: 'OK' }]
      );
      return;
    }

    const hasEmptyFields = courses.some(course => 
      !course.name.trim() || !course.credit.trim() || !course.grade.trim()
    );

    if (hasEmptyFields) {
      Alert.alert(
        'Incomplete Course Information',
        'Please fill in all course details before calculating.',
        [{ text: 'OK' }]
      );
        return;
      }

    const hasInvalidCredits = courses.some(course => 
      isNaN(Number(course.credit)) || Number(course.credit) <= 0
    );

    if (hasInvalidCredits) {
      Alert.alert(
        'Invalid Credits',
        'Please enter valid credit units for all courses.',
        [{ text: 'OK' }]
      );
        return;
      }

    setIsCalculating(true);
    try {
      const result = calculateGPA(courses, gradeScale);
      
      if (result.isValid && result.gpa !== null) {
        setGpa(result.gpa);
        Animated.spring(resultAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        
        // Save to history
        const newHistoryItem: HistoryItem = {
          name: gpaName.trim(),
          gpa: result.gpa.toFixed(2),
        };
        
        setIsSaving(true);
        try {
          const newHistory = [newHistoryItem, ...history];
          await saveHistory(newHistory);
          setHistory(newHistory);
        } catch (error) {
          Alert.alert(
            'Error Saving History',
            'Failed to save the calculation to history. Please try again.',
            [{ text: 'OK' }]
          );
          console.error('Error saving history:', error);
        } finally {
          setIsSaving(false);
        }
      } else {
        Alert.alert(
          'Invalid Grades',
          'Please check your grade inputs. Make sure they match the grade scale.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Calculation Error',
        'An error occurred while calculating your GPA. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error calculating GPA:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // History management
  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all your GPA calculation history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await saveHistory([]);
              setHistory([]);
            } catch (error) {
              Alert.alert(
                'Error Clearing History',
                'Failed to clear history. Please try again.',
                [{ text: 'OK' }]
              );
              console.error('Error clearing history:', error);
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // Grade scale management
  const handleEditGrade = (grade: GradeScale) => {
    setEditingGrade(grade);
    setShowGradeScaleModal(true);
  };

  const handleUpdateGrade = async (updatedGrade: GradeScale) => {
    {
      /* Feature to validate grade scale points 
    if (isNaN(Number(updatedGrade.points)) || Number(updatedGrade.points) < 0 || Number(updatedGrade.points) > 4.0) {
      Alert.alert(
        'Invalid Points',
        'Grade points must be between 0 and 4.0.',
        [{ text: 'OK' }]
      );
      return;
    }
    */
   }

    const newGradeScale = gradeScale.map(g => 
      g.grade === updatedGrade.grade ? updatedGrade : g
    );
    setGradeScale(newGradeScale);
    setShowGradeScaleModal(false);
    setEditingGrade(null);
    
    try {
      await saveGradeScale(newGradeScale);
    } catch (error) {
      Alert.alert(
        'Error Saving Grade Scale',
        'Failed to save the grade scale changes. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error saving grade scale:', error);
    }
  };

  const handleResetGradeScale = async () => {
    Alert.alert(
      'Reset Grade Scale',
      'Are you sure you want to reset the grade scale to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setGradeScale(DEFAULT_GRADE_SCALE);
              await saveGradeScale(DEFAULT_GRADE_SCALE);
            } catch (error) {
              Alert.alert(
                'Error Resetting Grade Scale',
                'Failed to reset the grade scale. Please try again.',
                [{ text: 'OK' }]
              );
              console.error('Error resetting grade scale:', error);
            }
          },
        },
      ]
    );
  };

  // Section switching animation
  const switchSection = (section: ActiveSection) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveSection(section);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'calculator' && styles.activeTab]}
          onPress={() => switchSection('calculator')}
        >
          <MaterialIcons 
            name="calculate" 
            size={24} 
            color={activeSection === 'calculator' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeSection === 'calculator' && styles.activeTabText]}>
            Calculator
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeSection === 'history' && styles.activeTab]}
          onPress={() => switchSection('history')}
        >
          <MaterialIcons 
            name="history" 
            size={24} 
            color={activeSection === 'history' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeSection === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeSection === 'settings' && styles.activeTab]}
          onPress={() => switchSection('settings')}
        >
          <MaterialIcons 
            name="settings" 
            size={24} 
            color={activeSection === 'settings' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeSection === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
      </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {activeSection === 'calculator' && (
            <CalculatorSection
              gpaName={gpaName}
              setGpaName={setGpaName}
              courses={courses}
              setCourses={setCourses}
              gpa={gpa}
              isCalculating={isCalculating}
              onAddCourse={addCourse}
              onRemoveCourse={removeCourse}
              onCalculate={handleCalculate}
              fadeAnim={fadeAnim}
              resultAnim={resultAnim}
              scaleAnim={scaleAnim}
            />
          )}

          {activeSection === 'history' && (
            <HistorySection
              history={history}
              isLoadingHistory={isLoadingHistory}
              isSaving={isSaving}
              onClearHistory={clearHistory}
              fadeAnim={fadeAnim}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              gradeScale={gradeScale}
              showGradeScaleModal={showGradeScaleModal}
              editingGrade={editingGrade}
              onEditGrade={handleEditGrade}
              onUpdateGrade={handleUpdateGrade}
              onResetGradeScale={handleResetGradeScale}
              onCloseModal={() => {
                setShowGradeScaleModal(false);
                setEditingGrade(null);
              }}
              fadeAnim={fadeAnim}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}