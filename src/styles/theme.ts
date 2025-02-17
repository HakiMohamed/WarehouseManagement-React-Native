import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Couleurs principales
  primary: '#FF6B00',    // Orange vif
  secondary: '#1C1C1E',  // Noir profond
  background: '#121214', // Noir pour le fond
  
  // Textes
  text: '#FFFFFF',      // Blanc pour le texte principal
  textSecondary: '#A0A0A5', // Gris clair pour le texte secondaire
  
  // États
  success: '#34C759',   // Vert pour les succès
  danger: '#FF3B30',    // Rouge pour les erreurs
  warning: '#FFBD2E',   // Orange clair pour les alertes
  
  // Interface
  card: '#1C1C1E',      // Noir moins profond pour les cartes
  input: '#2C2C2E',     // Gris très foncé pour les inputs
  border: '#2C2C2E',    // Bordures
  
  // Accents
  accent1: '#FF8A3D',   // Orange plus clair
  accent2: '#FFB480',   // Orange très clair
  
  // Utilitaires
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SIZES = {
  // Margins & Paddings
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,

  // Font Sizes
  h1: 32,
  h2: 24,
  h3: 18,
  body: 14,
  small: 12,

  // App Dimensions
  width,
  height,
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: '700',
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: '600',
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600',
  },
  body: {
    fontSize: SIZES.body,
    fontWeight: '400',
  },
  small: {
    fontSize: SIZES.small,
    fontWeight: '400',
  },
}; 