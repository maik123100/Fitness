// Dracula Theme Colors
export const draculaTheme = {
  // Background colors
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  
  // Primary colors
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
  
  // Semantic colors
  selection: '#44475a',
  
  // Custom semantic mappings for fitness app
  primary: '#bd93f9',       // Purple for primary actions
  secondary: '#8be9fd',     // Cyan for secondary elements
  success: '#50fa7b',       // Green for positive values
  warning: '#f1fa8c',       // Yellow for warnings
  danger: '#ff5555',        // Red for negative values/danger
  info: '#8be9fd',          // Cyan for info
  
  // Text colors
  text: {
    primary: '#f8f8f2',
    secondary: '#6272a4',
    muted: '#44475a',
    inverse: '#282a36',
  },
  
  // Surface colors
  surface: {
    primary: '#282a36',
    secondary: '#44475a',
    elevated: '#3c3f50',
    card: '#363949',
    input: '#44475a',
  },
  
  // Nutrition colors (macro-nutrients)
  nutrition: {
    protein: '#ff79c6',      // Pink for protein
    carbs: '#ffb86c',        // Orange for carbs  
    fat: '#f1fa8c',          // Yellow for fat
    calories: '#bd93f9',     // Purple for calories
    fiber: '#50fa7b',        // Green for fiber
    sugar: '#ff5555',        // Red for sugar
  },
  
  // Activity colors
  activity: {
    cardio: '#ff79c6',       // Pink for cardio
    strength: '#8be9fd',     // Cyan for strength training
    flexibility: '#50fa7b',   // Green for flexibility/yoga
    sports: '#ffb86c',       // Orange for sports
    daily: '#bd93f9',        // Purple for daily activities
  },
  
  // Status colors
  status: {
    over: '#ff5555',         // Red for over target
    under: '#f1fa8c',        // Yellow for under target
    onTarget: '#50fa7b',     // Green for on target
    excellent: '#bd93f9',    // Purple for excellent
  },
  
  // Chart colors
  chart: {
    primary: '#bd93f9',
    secondary: '#8be9fd',
    tertiary: '#ff79c6',
    quaternary: '#ffb86c',
    quinary: '#50fa7b',
    senary: '#f1fa8c',
  },
};

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Common border radius values
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Typography
export const typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    title: 24,
    heading: 28,
    display: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Shadow styles
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
};

export type DraculaTheme = typeof draculaTheme;