// Styles communs à réutiliser dans toutes les screens
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Inputs
  input: {
    backgroundColor: COLORS.input,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Headers
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  // Labels
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
}); 