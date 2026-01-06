/**
 * Service de gestion des couleurs pour les matières
 * Assigne une couleur unique à chaque matière de façon déterministe
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS_STORAGE_KEY = '@emploi_du_temps_subject_colors';

// Palette de couleurs vibrantes et bien contrastées
const COLOR_PALETTE = [
  '#FF6B6B', // Rouge vif
  '#4ECDC4', // Turquoise
  '#45B7D1', // Bleu ciel
  '#FFA07A', // Saumon
  '#98D8C8', // Menthe
  '#F7DC6F', // Jaune doré
  '#BB8FCE', // Violet
  '#85C1E2', // Bleu pastel
  '#F8B739', // Orange
  '#52C9A3', // Vert menthe
  '#FF85A2', // Rose
  '#6C5CE7', // Indigo
  '#00B894', // Vert
  '#FDCB6E', // Jaune
  '#E17055', // Orange-rouge
  '#74B9FF', // Bleu clair
  '#A29BFE', // Lavande
  '#FD79A8', // Rose vif
  '#FDCB6E', // Or
  '#6C7A89', // Gris-bleu
];

interface SubjectColorMap {
  [subject: string]: string;
}

/**
 * Génère un hash simple pour une chaîne de caractères
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32-bit
  }
  return Math.abs(hash);
}

/**
 * Récupère la couleur pour une matière donnée
 */
export async function getSubjectColor(subject: string): Promise<string> {
  try {
    const colorsJson = await AsyncStorage.getItem(COLORS_STORAGE_KEY);
    const colors: SubjectColorMap = colorsJson ? JSON.parse(colorsJson) : {};
    
    // Si la couleur existe déjà, la retourner
    if (colors[subject]) {
      return colors[subject];
    }
    
    // Sinon, générer une nouvelle couleur de façon déterministe
    const hash = hashString(subject);
    const colorIndex = hash % COLOR_PALETTE.length;
    const color = COLOR_PALETTE[colorIndex];
    
    // Sauvegarder la couleur pour la prochaine fois
    colors[subject] = color;
    await AsyncStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors));
    
    return color;
  } catch (error) {
    console.error('Erreur lors de la récupération de la couleur:', error);
    // Retourner une couleur par défaut en cas d'erreur
    return COLOR_PALETTE[0];
  }
}

/**
 * Récupère toutes les couleurs des matières
 */
export async function getAllSubjectColors(): Promise<SubjectColorMap> {
  try {
    const colorsJson = await AsyncStorage.getItem(COLORS_STORAGE_KEY);
    return colorsJson ? JSON.parse(colorsJson) : {};
  } catch (error) {
    console.error('Erreur lors de la récupération des couleurs:', error);
    return {};
  }
}

/**
 * Réinitialise toutes les couleurs
 */
export async function resetSubjectColors(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COLORS_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des couleurs:', error);
  }
}

/**
 * Convertit une couleur hex en RGBA avec opacité
 */
export function colorWithOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Obtient une couleur plus claire (pour les backgrounds)
 */
export function lightenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Obtient une couleur plus foncée (pour les textes)
 */
export function darkenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.max(0, Math.round(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.round(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.round(b * (1 - percent / 100)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
