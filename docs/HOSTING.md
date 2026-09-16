# Hébergement du test complet

L'application nécessite Next.js et FastAPI. Le `Dockerfile` regroupe les deux serveurs ; le serveur Python reste accessible uniquement à l'intérieur du conteneur. Le navigateur utilise une adresse HTTPS unique.

## Déploiement Render

1. Connecter le compte Render au dépôt GitHub contenant ce projet.
2. Créer un Blueprint à partir de ce dépôt et de `render.yaml`.
3. Vérifier que le service utilise le plan **Free**, puis lancer le déploiement.
4. Attendre que le service soit disponible et ouvrir l'adresse fournie par Render.

Le service configure automatiquement l'origine autorisée à partir de `RENDER_EXTERNAL_URL`. Aucun nom de domaine n'est à deviner. Les cookies de session utilisent HTTPS, y compris pour les dossiers de démonstration. Aucune clé d'IA n'est nécessaire.

Le plan gratuit utilise un stockage temporaire : les dossiers et documents de test peuvent disparaître à un redémarrage ou un nouveau déploiement. Il peut également se mettre en veille et demander un délai au premier accès. Ce service sert à tester avec des données fictives. Le fichier ne crée aucun disque ni service payant.

## Autre hébergeur de conteneurs

Construire le `Dockerfile`, exposer le port indiqué par `PORT` et définir `PUBLIC_APP_URL` avec l'URL HTTPS du service. Le lancement est `node scripts/start-hosted.mjs`. Les variables `DEMO_MODE=true`, `STORAGE_BACKEND=local` et `SESSION_COOKIE_SECURE=true` conservent le fonctionnement de démonstration. Pour conserver les données localement, un hébergeur disposant d'un volume persistant doit monter `/app/backend/data`.

L'hébergement d'un service réel demande les connexions PostgreSQL/S3 et les travaux de préparation à la production décrits dans le README. Le déploiement de test ne réalise pas ces intégrations.

## État

La configuration de déploiement est préparée. La publication attend la connexion au compte d'hébergement ; aucune URL en ligne n'est annoncée avant un déploiement réussi. Le moteur Docker local n'est pas disponible, donc la construction Linux complète du conteneur devra être vérifiée lors de ce déploiement.

Références officielles : [services web](https://render.com/docs/web-services), [Docker](https://render.com/docs/docker), [Blueprint](https://render.com/docs/blueprint-spec), [limites du plan gratuit](https://render.com/docs/free).
