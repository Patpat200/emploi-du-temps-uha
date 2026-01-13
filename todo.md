# TODO - Emploi du Temps UHA

## Fonctionnalités principales

- [x] Parser le fichier ICS et extraire les événements
- [x] Créer le service de synchronisation avec l'URL UHA
- [x] Implémenter le stockage local avec AsyncStorage
- [x] Créer le composant CourseCard pour afficher un cours
- [x] Créer le composant DayHeader pour les en-têtes de jour
- [x] Implémenter l'écran principal avec liste des cours
- [x] Ajouter le pull-to-refresh pour synchronisation manuelle
- [x] Implémenter le modal de détails du cours
- [x] Créer l'écran des paramètres
- [x] Ajouter la gestion du mode sombre/clair
- [ ] Implémenter la synchronisation automatique en arrière-plan
- [x] Ajouter les indicateurs de statut (modifié, annulé)
- [x] Gérer les états de chargement et d'erreur
- [x] Optimiser les performances et animations
- [x] Générer et configurer le logo de l'application

## Nouvelles fonctionnalités - Vue Calendrier

- [x] Créer le composant CalendarView pour afficher le calendrier mensuel
- [x] Implémenter la navigation entre les semaines
- [x] Ajouter les indicateurs de cours sur les jours du calendrier
- [x] Créer un nouvel onglet pour la vue calendrier
- [x] Ajouter la sélection de date pour afficher les cours du jour
- [x] Intégrer la vue calendrier avec les données existantes


## Bugs à corriger

- [x] Améliorer la gestion des erreurs de synchronisation
- [x] Ajouter des messages d'erreur détaillés
- [x] Implémenter le test d'URL dans les paramètres
- [x] Ajouter du logging détaillé pour le débogage
- [x] Créer des tests pour le service de synchronisation
- [x] Ajouter un composant de débogage
- [x] Corriger les problèmes de chargement initial des données


## Nouvelles fonctionnalités - Couleurs et Notifications

- [x] Créer un système de couleurs pour chaque matière
- [x] Implémenter le cache intelligent avec détection des changements
- [x] Ajouter les notifications pour les changements d'emploi du temps
- [x] Faire disparaître le statut "modifié" après 1 heure
- [x] Ajouter un système de timestamps pour les modifications
- [x] Créer des tests pour le système de couleurs et notifications


## Bugs à corriger - Ordre et Couleurs

- [x] Trier les cours par heure de début (du plus tôt au plus tard)
- [x] Simplifier le système de couleurs pour n'affecter que la barre de gauche
