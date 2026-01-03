# Plan de Design - Emploi du Temps UHA

## Vue d'ensemble
Application mobile pour afficher l'emploi du temps universitaire en temps réel, avec synchronisation automatique depuis le serveur ADE de l'UHA. L'application doit être simple, rapide et intuitive pour une utilisation quotidienne par les étudiants.

## Orientation et Usage
- **Orientation**: Portrait uniquement (9:16)
- **Usage**: Une main, navigation rapide
- **Plateforme**: iOS-first design (HIG compliant)

## Palette de Couleurs
- **Primary**: `#0a7ea4` (Bleu universitaire moderne)
- **Background**: `#ffffff` (light) / `#151718` (dark)
- **Surface**: `#f5f5f5` (light) / `#1e2022` (dark)
- **Foreground**: `#11181C` (light) / `#ECEDEE` (dark)
- **Accent Success**: `#22C55E` (cours confirmé)
- **Accent Warning**: `#F59E0B` (cours modifié récemment)
- **Accent Error**: `#EF4444` (cours annulé)

## Liste des Écrans

### 1. Écran Principal (Home)
**Nom**: Emploi du Temps
**Contenu**:
- Vue calendrier hebdomadaire avec défilement vertical
- Jour actuel mis en évidence
- Cartes de cours avec informations essentielles
- Indicateur de synchronisation en temps réel
- Bouton de rafraîchissement manuel

**Fonctionnalités**:
- Affichage des cours par jour
- Code couleur par type de cours (TD, TP, CM, SAE)
- Pull-to-refresh pour synchronisation manuelle
- Auto-refresh toutes les 15 minutes en arrière-plan
- Tap sur un cours pour voir les détails

### 2. Écran Détails du Cours (Modal)
**Nom**: Détails
**Contenu**:
- Titre complet du cours
- Horaires (début - fin)
- Salle / Lieu
- Enseignant(s)
- Groupe(s) concerné(s)
- Type d'événement
- Statut (nouveau, modifié, annulé)

**Fonctionnalités**:
- Affichage en modal bottom sheet
- Bouton de fermeture
- Possibilité d'ajouter au calendrier système (future feature)

### 3. Écran Paramètres (Settings)
**Nom**: Paramètres
**Contenu**:
- URL du flux ICS (pré-remplie)
- Fréquence de synchronisation
- Notifications (activées/désactivées)
- Mode sombre/clair
- À propos de l'application

**Fonctionnalités**:
- Modification de l'URL du flux
- Choix de la fréquence de sync (5, 15, 30, 60 min)
- Toggle pour notifications de changements
- Toggle pour mode sombre

## Flux Utilisateur Principal

### Flux 1: Consultation de l'emploi du temps
1. L'utilisateur ouvre l'application
2. L'écran principal affiche la semaine en cours
3. L'utilisateur fait défiler pour voir les jours suivants
4. L'utilisateur tape sur un cours pour voir les détails
5. Le modal s'ouvre avec toutes les informations
6. L'utilisateur ferme le modal

### Flux 2: Synchronisation manuelle
1. L'utilisateur tire vers le bas sur l'écran principal
2. L'indicateur de chargement apparaît
3. L'application télécharge le fichier ICS
4. Les cours sont mis à jour
5. Un message de confirmation s'affiche

### Flux 3: Configuration
1. L'utilisateur tape sur l'onglet Paramètres
2. L'écran des paramètres s'affiche
3. L'utilisateur modifie les préférences
4. Les changements sont sauvegardés automatiquement

## Structure des Données

### Événement de Cours
```typescript
interface CourseEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  teacher: string;
  group: string;
  type: 'CM' | 'TD' | 'TP' | 'SAE' | 'EXAM' | 'OTHER';
  status: 'normal' | 'modified' | 'cancelled';
  lastModified: Date;
}
```

## Composants UI Principaux

### 1. CourseCard
Carte affichant un cours dans la liste
- Heure de début (grande, bold)
- Titre du cours (tronqué si long)
- Salle (icône + texte)
- Badge de type (CM, TD, TP, etc.)
- Indicateur de statut (couleur de bordure)

### 2. DayHeader
En-tête de jour dans la liste
- Nom du jour (ex: "Lundi")
- Date (ex: "23 janvier")
- Badge "Aujourd'hui" si applicable

### 3. SyncIndicator
Indicateur de synchronisation
- Icône animée pendant le chargement
- Timestamp de dernière sync
- Statut (en ligne/hors ligne)

### 4. EmptyState
État vide quand pas de cours
- Icône illustrative
- Message "Pas de cours aujourd'hui"
- Suggestion d'action

## Interactions et Animations

### Interactions Tactiles
- **Tap sur CourseCard**: Haptic Light + ouverture modal (scale 0.97)
- **Pull-to-refresh**: Indicateur natif + haptic au déclenchement
- **Swipe horizontal**: Navigation entre semaines (future feature)

### Animations
- **Ouverture modal**: Slide up avec fade (300ms)
- **Fermeture modal**: Slide down avec fade (250ms)
- **Apparition des cartes**: Fade in séquentiel (80ms delay entre chaque)
- **Refresh**: Rotation de l'icône (400ms)

## Gestion des États

### États de l'Application
1. **Loading**: Première synchronisation
2. **Ready**: Données affichées
3. **Refreshing**: Synchronisation en cours
4. **Error**: Échec de synchronisation
5. **Offline**: Pas de connexion internet

### Gestion des Erreurs
- Message d'erreur discret en bas de l'écran
- Possibilité de réessayer
- Mode hors ligne avec dernières données en cache

## Persistance des Données
- **AsyncStorage** pour les préférences utilisateur
- **AsyncStorage** pour le cache des cours (JSON)
- Pas de backend nécessaire (application locale)

## Synchronisation en Temps Réel
- Téléchargement du fichier ICS depuis l'URL fournie
- Parsing du format iCalendar
- Détection des modifications via LAST-MODIFIED
- Comparaison avec les données en cache
- Notification si changement détecté

## Accessibilité
- Contraste suffisant pour tous les textes
- Tailles de police adaptatives
- Labels accessibles pour lecteurs d'écran
- Zones tactiles minimales de 44x44pt

## Performance
- Chargement initial < 2 secondes
- Refresh < 1 seconde
- Animations fluides 60fps
- Taille de l'app < 10MB
