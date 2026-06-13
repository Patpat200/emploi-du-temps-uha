# Fiche Play Store — Emploi du Temps UHA

---

## Titre de l'app
```
EDT UHA
```
*(30 caractères max — "Emploi du Temps UHA" fait 19 caractères, aussi valide)*

---

## Courte description (80 caractères max)
```
Consultez votre emploi du temps UHA en temps réel, où que vous soyez.
```

---

## Description longue (4000 caractères max)

```
📅 EDT UHA — Votre emploi du temps universitaire, toujours à portée de main.

Fini de jongler entre les fenêtres du site de l'UHA ! EDT UHA vous donne accès à votre emploi du temps directement depuis votre téléphone, synchronisé automatiquement et disponible même hors connexion.

🔄 SYNCHRONISATION AUTOMATIQUE
• Mise à jour en temps réel depuis le serveur de l'UHA
• Détection automatique des modifications, annulations et créations de cours
• Timeout intelligent : si le serveur tarde à répondre (>10s), l'app utilise le cache sans vous bloquer
• Fonctionne hors connexion grâce au cache local

📆 VUE CALENDRIER INTUITIVE
• Navigation semaine par semaine
• Cours triés par heure de début
• Bouton "Aujourd'hui" pour revenir rapidement au jour courant
• Indicateur du nombre de cours par jour

🎨 DESIGN SOIGNÉ
• Chaque matière a une couleur unique générée automatiquement
• Badges colorés selon le type de cours (CM, TD, TP, SAE, EXAM)
• Mode sombre et mode clair automatiques selon votre système
• Animations fluides entre les écrans

⚙️ ENTIÈREMENT PERSONNALISABLE
• Synchronisation automatique configurable (5, 15, 30 ou 60 minutes)
• Notifications en cas de modification de cours
• Vibrations activables/désactivables
• URL ICS personnalisable pour n'importe quel flux UHA

📋 DÉTAILS DU COURS EN UN CLIC
• Heure de début et de fin
• Salle et bâtiment
• Enseignant et groupe
• Type de cours et statut (normal, modifié, annulé)

Compatible avec tous les emplois du temps de l'Université de Haute-Alsace (UHA) au format ICS.
```

---

## Catégorie
```
Éducation
```

## Sous-catégorie
```
Outils d'étude
```

---

## Mots-clés (tags)
```
UHA, emploi du temps, université, Haute-Alsace, EDT, calendrier, cours, planning, étudiant, Mulhouse, Colmar
```

---

## Classification du contenu
```
Tout public (3+)
Pas de contenu sensible
```

---

## URL de confidentialité
> À créer — vous pouvez utiliser une page GitHub Pages ou Notion simple.
> Contenu minimal requis : "Cette application ne collecte aucune donnée personnelle. L'emploi du temps est téléchargé directement depuis les serveurs de l'UHA et stocké localement sur votre appareil."

---

## Coordonnées (email de support)
```
adilelb2007@gmail.com
```

---

## Notes internes Play Console

| Champ | Valeur |
|-------|--------|
| Package | `space.manus.emploi.du.temps.uha.t20260103091506` |
| Version actuelle | 1.0.2 |
| Orientation | Portrait uniquement |
| Permissions | POST_NOTIFICATIONS |
| Android min SDK | Voir eas.json |
| Taille estimée | ~30-50 MB |

---

## Fichiers à uploader dans la Play Console

| Fichier | Emplacement | Dimensions |
|---------|------------|------------|
| Icône | `assets/images/icon-playstore-512.png` | 512×512 px |
| Feature graphic | `assets/images/feature-graphic-1024x500.png` | 1024×500 px |
| Screenshots | À prendre sur votre téléphone (voir guide) | min 320px |

---

## Guide : Prendre les screenshots

Lancez l'app sur votre téléphone Android et prenez une capture d'écran de chaque écran :

1. **Écran principal** — liste des cours du jour
2. **Vue calendrier** — semaine avec jours cliqués
3. **Détail d'un cours** — modal ouvert sur un cours
4. **Paramètres** — page des réglages

Sur Android : appuyez simultanément sur **Volume bas + Bouton power**.

Le Play Store recommande **au moins 2 screenshots**, maximum 8.
Dimensions acceptées : entre **320px et 3840px** sur le côté le plus court.

---

## Guide : Configurer la Play Console (étape par étape)

1. Allez sur **play.google.com/console**
2. Cliquez **"Créer une application"**
3. Langue par défaut : **Français (France)**
4. Nom : **EDT UHA**
5. Type : **Application**
6. Gratuite ou payante : **Gratuite**
7. Acceptez les politiques → **Créer l'application**

### Dans "Présence dans les stores" → "Fiche Play Store principale"
- Copier-coller les textes ci-dessus
- Uploader icône 512x512 et feature graphic
- Ajouter les screenshots
- Catégorie : **Éducation**

### Dans "Production" → "Versions"
- Uploader votre fichier `.aab` (généré par `eas build`)
- Remplir les notes de version
- Soumettre en **brouillon** (ne publiez pas encore)

### Déclaration de confidentialité
- Dans "Politique de confidentialité" : entrez l'URL de votre page
- Dans "Sécurité des données" : cochez "Aucune donnée collectée"
