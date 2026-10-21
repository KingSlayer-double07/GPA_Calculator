import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SettingsSection } from '@/components/SettingsSection';
import { Screen } from '@/components/Screen';
import { StorageErrorBanner } from '@/components/StorageErrorBanner';
import { useAppData } from '@/context/AppDataContext';
import { GradeScale } from '@/types';

export default function SettingsScreen() {
  const { gradeScale, setGradePoints, resetGradeScale } = useAppData();
  const [editingGrade, setEditingGrade] = useState<GradeScale | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <Screen>
      <StorageErrorBanner />
      <SettingsSection
        gradeScale={gradeScale}
        editingGrade={editingGrade}
        onEditGrade={setEditingGrade}
        onSaveGrade={(points) => {
          if (editingGrade) setGradePoints(editingGrade.grade, points);
          setEditingGrade(null);
        }}
        onCancelEdit={() => setEditingGrade(null)}
        onResetGradeScale={() => setConfirmingReset(true)}
      />
      <ConfirmDialog
        visible={confirmingReset}
        title="Reset Grade Scale"
        message="Are you sure you want to reset the grade scale to default values?"
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          setConfirmingReset(false);
          resetGradeScale();
        }}
        onCancel={() => setConfirmingReset(false)}
      />
    </Screen>
  );
}
