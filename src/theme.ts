// Colours used across the app. Text and button colours meet WCAG AA contrast (4.5:1);
// icon-only controls meet the 3:1 minimum for UI components.
// Keep `primary` in sync with theme_color in public/manifest.json.
export const colors = {
  primary: '#0066CC', // buttons, active tab, result card; 5.6:1 with white
  success: '#2E7D32', // "Add Course"; 5.1:1 with white
  danger: '#E63946', // destructive icons
  error: '#C62828', // error text and destructive buttons; 5.3:1 on the page background
  text: '#1A1A1A',
  textMuted: '#666666',
  placeholder: '#6B7280', // 4.6:1 on the input background
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E5E5',
} as const;
