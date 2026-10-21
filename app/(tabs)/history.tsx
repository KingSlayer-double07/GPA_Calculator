import React, { useState } from 'react';
import Head from 'expo-router/head';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { HistorySection } from '@/components/HistorySection';
import { Screen } from '@/components/Screen';
import { StorageErrorBanner } from '@/components/StorageErrorBanner';
import { useAppData } from '@/context/AppDataContext';

export default function HistoryScreen() {
  const { history, isLoaded, clearHistory } = useAppData();
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <Screen>
      <Head>
        <title>History - GPA Calculator</title>
      </Head>
      <StorageErrorBanner />
      <HistorySection
        history={history}
        isLoadingHistory={!isLoaded}
        onClearHistory={() => setConfirmingClear(true)}
      />
      <ConfirmDialog
        visible={confirmingClear}
        title="Clear History"
        message="Are you sure you want to clear all your GPA calculation history?"
        confirmLabel="Clear"
        destructive
        onConfirm={() => {
          setConfirmingClear(false);
          clearHistory();
        }}
        onCancel={() => setConfirmingClear(false)}
      />
    </Screen>
  );
}
