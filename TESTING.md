# Guide de Test - Emploi du Temps UHA

## Comment tester l'application

### Option 1: Tester sur votre téléphone (Recommandé)

1. **Installer Expo Go** sur votre téléphone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scanner le QR code** affiché dans l'interface de prévisualisation

3. **L'application s'ouvrira** dans Expo Go sur votre téléphone

### Option 2: Tester dans le navigateur web

L'aperçu web est actuellement vide car l'application charge les données depuis AsyncStorage qui n'est pas encore initialisé.

Pour tester dans le navigateur:
1. Ouvrez les outils de développement (F12)
2. Tirez vers le bas pour déclencher la synchronisation
3. Les cours devraient apparaître après le téléchargement

### Fonctionnalités à tester

#### Écran principal
- ✅ Tirez vers le bas pour synchroniser l'emploi du temps
- ✅ Vérifiez que les cours s'affichent groupés par jour
- ✅ Tapez sur un cours pour voir les détails
- ✅ Vérifiez les badges de type (CM, TD, TP, SAE)
- ✅ Vérifiez l'affichage des horaires et salles

#### Modal de détails
- ✅ Vérifiez toutes les informations du cours
- ✅ Fermez le modal en tapant sur le bouton X ou en dehors

#### Écran des paramètres
- ✅ Modifiez l'URL du flux ICS
- ✅ Testez la synchronisation après modification
- ✅ Activez/désactivez les options

#### Mode sombre
- ✅ Changez le mode sombre/clair dans les paramètres système
- ✅ Vérifiez que l'application s'adapte automatiquement

## Notes importantes

- **Première utilisation**: L'application télécharge automatiquement l'emploi du temps au premier lancement
- **Synchronisation**: Tirez vers le bas pour actualiser manuellement
- **Données en cache**: Les cours sont sauvegardés localement et restent disponibles hors ligne
- **URL par défaut**: L'URL de votre emploi du temps UHA est pré-configurée

## Problèmes connus

- La synchronisation automatique en arrière-plan n'est pas encore implémentée (nécessite des tâches en arrière-plan)
- L'aperçu web peut afficher "Aucun cours à venir" au premier chargement (normal, tirez vers le bas)
