import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  LayoutAnimation,
  UIManager,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HistoryItem {
  name: string;
  gpa: string;
}

interface GradeScale {
  grade: string;
  points: number;
}

const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { grade: 'A', points: 5 },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
  { grade: 'D', points: 2 },
  { grade: 'E', points: 1 },
  { grade: 'F', points: 0 }
];

export default function GPACalculator() {
  const [courses, setCourses] = useState([{ name: '', credit: '', grade: '' }]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [gpaName, setGpaName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'calculator' | 'history' | 'settings'>('calculator');
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(DEFAULT_GRADE_SCALE);
  const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeScale | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
    loadGradeScale();
  }, []);

  // Animate section change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: activeSection === 'calculator' ? 0 : activeSection === 'history' ? 1 : 2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeSection]);

  const addCourse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCourses([...courses, { name: '', credit: '', grade: '' }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeCourse = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const calculateGPA = async () => {
    if (!gpaName.trim()) {
      alert("Please enter a name for this GPA calculation.");
      return;
    }
    setIsCalculating(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    let totalCredits = 0;
    let totalPoints = 0;
    let isValid = true;

    courses.forEach(({ credit, grade }) => {
      if (!grade.trim() || !credit.trim()) {
        alert("All fields (Grade and Credit) must be filled before calculating GPA.");
        isValid = false;
        return;
      }
      const creditNum = parseFloat(credit);
      if (isNaN(creditNum) || creditNum <= 0) {
        alert("Credit must be a positive number.");
        isValid = false;
        return;
      }
      const gradePoint = getGradePoint(grade);
      if (!isNaN(creditNum) && gradePoint !== null) {
        totalCredits += creditNum;
        totalPoints += creditNum * gradePoint;
      }
    });

    if (!isValid) {
      setIsCalculating(false);
      return;
    }

    const calculatedGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;
    setGpa(calculatedGPA);
    
    // Animate result appearance
    if (calculatedGPA) {
      Animated.spring(resultAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      await saveHistory(gpaName, calculatedGPA.toString());
    }
    
    setIsCalculating(false);
  };

  const saveHistory = async (name: string, newGPA: string) => {
    setIsSaving(true);
    if (history.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      alert("This GPA name already exists. Please use a different name.");
      setIsSaving(false);
      return;
    }
    const updatedHistory = [{ name: name || 'Unnamed GPA', gpa: newGPA }, ...history];
    setHistory(updatedHistory);
    await AsyncStorage.setItem('gpaHistory', JSON.stringify(updatedHistory));
    setIsSaving(false);
  };
  
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const savedHistory = await AsyncStorage.getItem('gpaHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadGradeScale = async () => {
    try {
      const savedScale = await AsyncStorage.getItem('gradeScale');
      if (savedScale) {
        setGradeScale(JSON.parse(savedScale));
      }
    } catch (error) {
      console.error('Error loading grade scale:', error);
    }
  };

  const saveGradeScale = async (newScale: GradeScale[]) => {
    try {
      await AsyncStorage.setItem('gradeScale', JSON.stringify(newScale));
      setGradeScale(newScale);
    } catch (error) {
      console.error('Error saving grade scale:', error);
    }
  };

  const handleGradeScaleEdit = (grade: GradeScale) => {
    setEditingGrade(grade);
    setShowGradeScaleModal(true);
  };

  const handleGradeScaleUpdate = (updatedGrade: GradeScale) => {
    const newScale = gradeScale.map(g => 
      g.grade === updatedGrade.grade ? updatedGrade : g
    );
    saveGradeScale(newScale);
    setShowGradeScaleModal(false);
    setEditingGrade(null);
  };

  const resetGradeScale = async () => {
    Alert.alert(
      "Reset Grade Scale",
      "Are you sure you want to reset to the default grade scale?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            await saveGradeScale(DEFAULT_GRADE_SCALE);
            Alert.alert("Success", "Grade scale has been reset to default");
          }
        }
      ]
    );
  };

  const getGradePoint = (grade: string): number => {
    const gradeScaleItem = gradeScale.find(g => g.grade === grade.toUpperCase());
    return gradeScaleItem ? gradeScaleItem.points : -1;
  };

  const clearScreen = () => {
    setGpa(null);
    setCourses([{ name: '', credit: '', grade: '' }]);
    setGpaName('');
  };

  const clearHistory = async () => {
    setIsSaving(true);
    setHistory([]);
    await AsyncStorage.removeItem('gpaHistory');
    setIsSaving(false);
  };

  const alertUser = () => {
    Alert.alert("Clear History?", "Are you sure you want to delete all records?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => clearHistory() }
    ]);
  }

  const renderCalculatorSection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          transform: [
            { translateX: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [0, -20, -40],
            })}
          ],
          opacity: fadeAnim,
        }
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
                    onPress={() => removeCourse(index)}
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
            onPress={addCourse}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Add Course</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.calculateButton, isCalculating && styles.disabledButton]} 
              onPress={calculateGPA}
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
              {
                transform: [
                  { scale: resultAnim },
                  { translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })}
                ],
                opacity: resultAnim,
              }
            ]}
          >
            <Text style={styles.resultLabel}>Your GPA</Text>
            <Text style={styles.resultValue}>{gpa}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderHistorySection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          transform: [
            { translateX: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [20, 0, -20],
            })}
          ],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity 
              onPress={alertUser}
              style={styles.clearHistoryButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#E63946" size="small" />
              ) : (
                <MaterialIcons name="delete-outline" size={24} color="#E63946" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Animated.View 
                style={[
                  styles.historyCard,
                  {
                    transform: [
                      { translateX: slideAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [20, 0, -20],
                      })}
                    ],
                    opacity: fadeAnim,
                  }
                ]}
              >
                <View>
                  <Text style={styles.historyName}>{item.name}</Text>
                  <Text style={styles.historyDate}>Calculated on {new Date().toLocaleDateString()}</Text>
                </View>
                <Text style={styles.historyGPA}>{item.gpa}</Text>
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyListContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No calculations yet</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderSettingsSection = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          transform: [
            { translateX: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [20, 0, -20],
            })}
          ],
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
              onPress={resetGradeScale}
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
                onPress={() => handleGradeScaleEdit(grade)}
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
        onRequestClose={() => setShowGradeScaleModal(false)}
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
                    handleGradeScaleUpdate({ ...editingGrade, points });
                  }}
                  placeholder="Enter points"
                />
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowGradeScaleModal(false)}
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'calculator' && styles.activeTab]} 
          onPress={() => setActiveSection('calculator')}
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
          onPress={() => setActiveSection('history')}
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
          onPress={() => setActiveSection('settings')}
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

      {activeSection === 'calculator' ? renderCalculatorSection() : 
       activeSection === 'history' ? renderHistorySection() : 
       renderSettingsSection()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: '#F8F9FA',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
  },
  historyListContent: {
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    padding: 20,
  },
  nameInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  deleteButton: {
    padding: 5,
  },
  courseInput: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    width: '48%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  resultLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  resultValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  clearHistoryButton: {
    padding: 5,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyGPA: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  section: {
    flex: 1,
  },
  settingsSection: {
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  resetButton: {
    padding: 5,
  },
  gradeScaleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  gradeScaleInfo: {
    flex: 1,
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  modalGrade: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});