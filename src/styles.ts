import { StyleSheet } from 'react-native';
import { colors } from './theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hidden: {
    display: 'none',
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
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  inputSection: {
    padding: 20,
  },
  hintText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  nameField: {
    marginBottom: 20,
  },
  nameInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
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
    color: colors.text,
  },
  deleteButton: {
    padding: 5,
  },
  courseInput: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  courseField: {
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallField: {
    width: '48%',
    marginBottom: 10,
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderColor: '#F5C2C0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  bannerSlot: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  bannerText: {
    flex: 1,
    color: '#8A1C1C',
    fontSize: 14,
    marginHorizontal: 8,
  },
  formError: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 20,
  },
  dialogMessage: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancel: {
    backgroundColor: '#F1F3F5',
    marginRight: 10,
  },
  dialogCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  dialogPrimary: {
    backgroundColor: colors.primary,
  },
  dialogDestructive: {
    backgroundColor: colors.error,
  },
  dialogButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: colors.primary,
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
    marginEnd: 10,
    marginStart: 10
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 14,
    color: colors.textMuted,
  },
  historyGPA: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textMuted,
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
    color: colors.textMuted,
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
    color: colors.text,
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
    color: colors.text,
  },
  pointsText: {
    fontSize: 14,
    color: colors.textMuted,
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
    color: colors.text,
  },
  modalGrade: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalError: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
}); 