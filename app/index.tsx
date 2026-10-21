import React, { useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Text, Animated, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CalculatorSection } from './components/CalculatorSection';
import { HistorySection } from './components/HistorySection';
import { SettingsSection } from './components/SettingsSection';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InlineMessage } from './components/InlineMessage';
import { Course, HistoryItem, GradeScale, ActiveSection } from './types';
import { DEFAULT_GRADE_SCALE } from './constants/gradeScale';
import { saveHistory, loadHistory, saveGradeScale, loadGradeScale } from './utils/storage';
import { calculateGPA, validateInputs } from './utils/calculator';
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

  // Validation / feedback. Alert.alert() does nothing on web, so feedback is rendered in the page.
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<'clear-history' | 'reset-scale' | null>(null);

  // Loading states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const scaleAnim = new Animated.Value(1);
  const resultAnim = new Animated.Value(0);

  const errors = useMemo(
    () => validateInputs(gpaName, courses, gradeScale),
    [gpaName, courses, gradeScale]
  );

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
      setNotice('Could not load your saved history and grade scale. Defaults are being used.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Course management functions
  const addCourse = () => {
    setShowErrors(false);
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
    if (courses.length <= 1) return;
    setCourses(courses.filter((_, i) => i !== index));
  };

  // GPA calculation
  const handleCalculate = async () => {
    if (errors.count > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setNotice(null);

    setIsCalculating(true);
    try {
      const result = calculateGPA(courses, gradeScale);

      if (result.isValid && result.gpa !== null) {
        setGpa(result.gpa);
        Animated.spring(resultAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        const newHistoryItem: HistoryItem = {
          name: gpaName.trim(),
          gpa: result.gpa.toFixed(2),
        };
        const newHistory = [newHistoryItem, ...history];
        setHistory(newHistory);

        setIsSaving(true);
        try {
          await saveHistory(newHistory);
        } catch (error) {
          console.error('Error saving history:', error);
          setNotice('Your GPA was calculated, but it could not be saved to history on this device.');
        } finally {
          setIsSaving(false);
        }
      } else {
        setNotice(result.message ?? 'Check your grades and units, then try again.');
      }
    } catch (error) {
      console.error('Error calculating GPA:', error);
      setNotice('Something went wrong while calculating your GPA. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // History management
  const clearHistory = async () => {
    setIsSaving(true);
    try {
      await saveHistory([]);
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      setNotice('Could not clear your history. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Grade scale management
  const handleEditGrade = (grade: GradeScale) => {
    setEditingGrade(grade);
    setShowGradeScaleModal(true);
  };

  const handleUpdateGrade = async (updatedGrade: GradeScale) => {
    const newGradeScale = gradeScale.map(g => 
      g.grade === updatedGrade.grade ? updatedGrade : g
    );
    setGradeScale(newGradeScale);
    setShowGradeScaleModal(false);
    setEditingGrade(null);
    
    try {
      await saveGradeScale(newGradeScale);
    } catch (error) {
      console.error('Error saving grade scale:', error);
      setNotice('Could not save your grade scale changes on this device.');
    }
  };

  const resetGradeScale = async () => {
    setGradeScale(DEFAULT_GRADE_SCALE);
    try {
      await saveGradeScale(DEFAULT_GRADE_SCALE);
    } catch (error) {
      console.error('Error resetting grade scale:', error);
      setNotice('Could not reset your grade scale. Please try again.');
    }
  };

  const confirmDialog = pendingConfirm === 'clear-history'
    ? {
        title: 'Clear History',
        message: 'Are you sure you want to clear all your GPA calculation history?',
        confirmLabel: 'Clear',
        run: clearHistory,
      }
    : pendingConfirm === 'reset-scale'
    ? {
        title: 'Reset Grade Scale',
        message: 'Are you sure you want to reset the grade scale to default values?',
        confirmLabel: 'Reset',
        run: resetGradeScale,
      }
    : null;

  const handleConfirm = async () => {
    const action = confirmDialog;
    setPendingConfirm(null);
    if (action) await action.run();
  };

  // Section switching animation
  const switchSection = (section: ActiveSection) => {
    setActiveSection(section);
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

      {notice && (
        <View style={styles.bannerSlot}>
          <InlineMessage message={notice} onDismiss={() => setNotice(null)} />
        </View>
      )}

      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.section,
          ]}
        >
          {activeSection === 'calculator' && (
            <CalculatorSection
              gpaName={gpaName}
              setGpaName={setGpaName}
              courses={courses}
              setCourses={setCourses}
              gpa={gpa}
              gradeScale={gradeScale}
              errors={errors}
              showErrors={showErrors}
              isCalculating={isCalculating}
              onAddCourse={addCourse}
              onRemoveCourse={removeCourse}
              onCalculate={handleCalculate}
              resultAnim={resultAnim}
              scaleAnim={scaleAnim}
            />
          )}

          {activeSection === 'history' && (
            <HistorySection
              history={history}
              isLoadingHistory={isLoadingHistory}
              isSaving={isSaving}
              onClearHistory={() => setPendingConfirm('clear-history')}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              gradeScale={gradeScale}
              showGradeScaleModal={showGradeScaleModal}
              editingGrade={editingGrade}
              onEditGrade={handleEditGrade}
              onUpdateGrade={handleUpdateGrade}
              onResetGradeScale={() => setPendingConfirm('reset-scale')}
              onCloseModal={() => {
                setShowGradeScaleModal(false);
                setEditingGrade(null);
              }}
            />
          )}
        </Animated.View>
      </View>

      <ConfirmDialog
        visible={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        confirmLabel={confirmDialog?.confirmLabel ?? ''}
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setPendingConfirm(null)}
      />
    </View>
  );
}