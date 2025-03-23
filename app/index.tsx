import react, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { useNavigation } from 'expo-router';

export default function GPACalculator() {
  const [courses, setCourses] = useState([{ name: '', credit: '', grade: '' }]);
  const [gpa, setGpa] = useState(0.0);
  const [history, setHistory] = useState([]);
  const [gpaName, setGpaName] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const addCourse = () => {
    setCourses([...courses, { name: '', credit: '', grade: '' }]);
  };

  const calculateGPA = () => {
    if (!gpaName.trim()) {
      alert("Please enter a name for this GPA calculation.");
      return;
    }
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

    if (!isValid) return;

    const calculatedGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
    setGpa(calculatedGPA);
    if (calculatedGPA){
      saveHistory(gpaName, calculatedGPA);
    }
  };

  const saveHistory = async (name:string, newGPA:string) => {
    if (history.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      alert("This GPA name already exists. Please use a different name.");
      return;
    }
    const updatedHistory = [{ name: name || 'Unnamed GPA', gpa: newGPA.toString() }, ...history];
    setHistory(updatedHistory);
    await AsyncStorage.setItem('gpaHistory', JSON.stringify(updatedHistory));
  };
  
  const loadHistory = async () => {
    const savedHistory = await AsyncStorage.getItem('gpaHistory');
    if (savedHistory){
      setHistory(JSON.parse(savedHistory));
    }
  };

  const clearScreen = () => {
    setGpa(null);
    setCourses([]);
    setGpaName('');
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem('gpaHistory');
  };

  const alertUser = () => {
    Alert.alert("Clear History?", "Are you sure you want to delete all records?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => clearHistory() }
    ]);
  }

  const getGradePoint = (grade:string): number => {
    switch (grade.toUpperCase()){
      case 'A': return 5;
      case 'B': return 4;
      case 'C': return 3;
      case 'D': return 2;
      case 'E': return 1;
      case 'F': return 0;
      default: return -1;
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPA Calculator</Text>
      <ScrollView>
        <TextInput 
      style={styles.input}
      placeholder="Name this calcullation" 
          value={gpaName} 
          onChangeText={setGpaName}
        />
        {courses.map((course, index) => (
        <View key={index} style={styles.courseContainer}>
            <TextInput
              placeholder="Course Name"
              value={course.name}
              onChangeText={(text) => {
                const newCourses = [...courses];
                newCourses[index].name = text;
                setCourses(newCourses);
              }}
            style={styles.input}
            />
              <TextInput
            placeholder="Credit Units"
                keyboardType="numeric"
                value={course.credit}
                onChangeText={(text) => {
                  const newCourses = [...courses];
                  newCourses[index].credit = text;
                  setCourses(newCourses);
                }}
            style={styles.input}
              />
              <TextInput
            placeholder="Grade (A-F)"
                value={course.grade}
                onChangeText={(text) => {
                  const validGrades = ['A', 'B', 'C', 'D', 'F'];
                  const formattedText = text.toUpperCase();
                  if (validGrades.includes(formattedText) || formattedText === '') {
                    const newCourses = [...courses];
                newCourses[index].grade = text;
                    setCourses(newCourses);
              } else {
                alert("Invalid grade entered. Use A, B, C, D, or F.");
                  }
                }}
            style={styles.input}
              />
            </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button}  onPress={addCourse}>
          <Text style={styles.buttonText}>Add Course</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={calculateGPA}>
          <Text style={styles.buttonText}>Calculate GPA</Text>
        </TouchableOpacity>
      <TouchableOpacity style={[styles.buttonClear, {backgroundColor: "#E63946"}]} onPress={clearScreen}>
        <Text style={styles.buttonText}>Clear Screen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.buttonClear, {backgroundColor: "#E63946"}]} onPress={alertUser}>
        <Text style={styles.buttonText}>Clear History</Text>
      </TouchableOpacity>
      </View>

      {gpa !== null && <Text style={{ fontSize: 20, marginTop: 10 }}>Your GPA: {gpa}</Text>}
      <Text style={styles.historyTitle}>History:</Text>

      {history.length > 0 ? (
      <FlatList 
      keyboardDismissMode='on-drag'
          data={history}
      renderItem={({ item }) => <Text style={styles.historyItem}>{item.name}: {item.gpa}</Text>}
      keyExtractor={(item, index) => index.toString()} 
        />
      ) : (
      <Text>No history yet.</Text>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  courseContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  button: {
    flexBasis: '45%',
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonClear: {
    flexBasis: '45%',
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  historyItem: {
    fontSize: 16,
    padding: 5,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 5,
  },
});