# Fichiers de test CampusPath

Neuf fichiers pour éprouver l'import de documents. Tout le contenu est inventé, aucune pièce n'a de valeur administrative. Le personnage est Imane Bennani, le profil de démonstration de l'application.

Chaque fichier a été envoyé à l'API réelle avant livraison, la colonne « résultat attendu » est ce que le serveur a effectivement répondu.

## Les quatre documents valides

| Fichier | Type à choisir | Résultat attendu |
| --- | --- | --- |
| `releve-notes-bac.pdf` | Relevé de notes | Import accepté. L'email est détecté et proposé en fait à vérifier. |
| `diplome-baccalaureat.pdf` | Diplôme | Import accepté, aucun champ reconnu. À saisir à la main. |
| `attestation-francais-b2.pdf` | Langue | Import accepté, email détecté. |
| `cv-etudiant.pdf` | CV | Import accepté, email détecté. |

Le relevé de notes contient un tableau de six matières avec notes et coefficients, de quoi remplir l'analyse académique.

## Les cinq cas limites

| Fichier | Ce qu'il déclenche |
| --- | --- |
| `carte-etudiant.png` | Image acceptée, mais l'OCR n'est pas branché. Message invitant à saisir manuellement. |
| `pdf-protege.pdf` | PDF chiffré, lecture impossible. Le mot de passe est `campuspath` si tu veux le déverrouiller. |
| `faux-pdf-non-supporte.pdf` | Fichier texte déguisé en PDF. Refusé, le serveur vérifie le contenu et pas l'extension. |
| `doublon-releve-notes.pdf` | Copie exacte du relevé de notes. Refusé comme doublon, à envoyer après le relevé. |
| `trop-volumineux.pdf` | Un peu plus de 11 Mo. Refusé, la limite est de 10 Mo. |

## Ordre conseillé

1. Les quatre documents valides, pour remplir le dossier.
2. `doublon-releve-notes.pdf`, qui n'a de sens qu'après le relevé.
3. Les trois refus, pour voir les messages d'erreur.
4. `carte-etudiant.png` en dernier, pour comparer le traitement d'une image.
