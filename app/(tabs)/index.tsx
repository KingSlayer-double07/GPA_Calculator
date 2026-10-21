import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CalculatorSection } from '@/components/CalculatorSection';
import { InlineMessage } from '@/components/InlineMessage';
import { Screen } from '@/components/Screen';
import { StorageErrorBanner } from '@/components/StorageErrorBanner';
import { useAppData } from '@/context/AppDataContext';
import { Course } from '@/types';
import { calculateGPA, formatGpa, validateInputs } from '@/utils/calculator';
import { createCourse } from '@/utils/course';
import { styles } from '@/styles';

export default function CalculatorScreen() {
  const { gradeScale, isLoaded, addHistoryItem } = useAppData();

  const [gpaName, setGpaName] = useState('');
  const [courses, setCourses] = useState<Course[]>(() => [createCourse()]);
  const [calculated, setCalculated] = useState<{ gpa: number; signature: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const errors = useMemo(
    () => validateInputs(gpaName, courses, gradeScale),
    [gpaName, courses, gradeScale]
  );

  // Identifies exactly what a result was calculated from. The result is shown only while the
  // inputs (or the grade scale) still match it, so it can never go stale after an edit.
  const signature = useMemo(
    () =>
      JSON.stringify([
        gpaName.trim(),
        courses.map((c) => [c.name.trim(), c.credit.trim(), c.grade]),
        gradeScale,
      ]),
    [gpaName, courses, gradeScale]
  );
  const gpa = calculated?.signature === signature ? calculated.gpa : null;

  const changeCourse = (id: string, changes: Partial<Omit<Course, 'id'>>) => {
    setCourses((current) => current.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  };

  const addCourse = () => {
    setShowErrors(false);
    setCourses((current) => [...current, createCourse()]);
  };

  const removeCourse = (id: string) => {
    setCourses((current) => (current.length > 1 ? current.filter((c) => c.id !== id) : current));
  };

  const handleCalculate = () => {
    if (errors.count > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setNotice(null);

    // These exact inputs were already calculated and saved; don't add a duplicate history entry.
    if (gpa !== null) return;

    const result = calculateGPA(courses, gradeScale);
    if (!result.isValid || result.gpa === null) {
      setNotice(result.message ?? 'Check your grades and units, then try again.');
      return;
    }

    setCalculated({ gpa: result.gpa, signature });
    addHistoryItem({ name: gpaName.trim(), gpa: formatGpa(result.gpa) });
  };

  return (
    <Screen>
      <StorageErrorBanner />
      {notice && (
        <View style={styles.bannerSlot}>
          <InlineMessage message={notice} onDismiss={() => setNotice(null)} />
        </View>
      )}
      <CalculatorSection
        gpaName={gpaName}
        onChangeName={setGpaName}
        courses={courses}
        onChangeCourse={changeCourse}
        gpa={gpa}
        gradeScale={gradeScale}
        errors={errors}
        showErrors={showErrors}
        calculateDisabled={!isLoaded}
        onAddCourse={addCourse}
        onRemoveCourse={removeCourse}
        onCalculate={handleCalculate}
      />
    </Screen>
  );
}
