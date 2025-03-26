import { Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';

// Initialize analytics (Firebase initializes automatically)
export const initializeAnalytics = async () => {
  try {
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

// Track app open
export const trackAppOpen = async () => {
  try {
    await analytics().logEvent('app_open', {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    });
  } catch (error) {
    console.error('Failed to track app open:', error);
  }
};

// Track GPA calculation
export const trackGPACalculation = async (gpa: number, courseCount: number) => {
  try {
    await analytics().logEvent('gpa_calculation', {
      gpa,
      courseCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track GPA calculation:', error);
  }
};

// Track course addition
export const trackCourseAddition = async (courseName: string) => {
  try {
    await analytics().logEvent('course_added', {
      courseName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track course addition:', error);
  }
};

// Track grade scale modification
export const trackGradeScaleModification = async (grade: string, points: number) => {
  try {
    await analytics().logEvent('grade_scale_modified', {
      grade,
      points,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track grade scale modification:', error);
  }
};

// Track history clearing
export const trackHistoryCleared = async () => {
  try {
    await analytics().logEvent('history_cleared', {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track history clearing:', error);
  }
}; 