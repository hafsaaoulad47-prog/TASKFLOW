# TaskFlow — Application de gestion de projets collaboratifs

## Technologies utilisées
- **Frontend** : HTML / CSS / JavaScript (Axios)
- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB (dans Docker)
- **Auth** : JWT + bcryptjs
- **Infrastructure** : Docker + Docker Compose

---

## Structure du projet

```
taskflow/
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── .env               ← À ne JAMAIS committer
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Activity.js
│   │   └── Notification.js
│   └── routes/
│       ├── auth.js
│       ├── projects.js
│       ├── tasks.js
│       ├── dashboard.js
│       └── notifications.js
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

---

## 🚀 Lancement du projet

### Prérequis
- Docker Desktop installé et démarré
- Git installé

### Étapes

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd taskflow

# 2. Vérifier le fichier .env dans backend/
# (le fichier .env est déjà fourni pour le dev — NE PAS committer)
cat backend/.env

# 3. Lancer toute l'application
docker-compose up --build
```

### Accès
| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000       |
| Backend   | http://localhost:5000       |
| MongoDB   | localhost:27017             |

---

## Workflow Git

```bash
# Créer une branche par fonctionnalité
git checkout develop
git checkout -b feature/authentification

# Commits avec Conventional Commits
git commit -m "feat: add user schema with bcrypt password hashing"
git commit -m "feat: implement JWT login route"
git commit -m "feat: add authentication middleware"

# Push et Pull Request
git push origin feature/authentification
# → Ouvrir une PR vers develop sur GitHub
```

### Branches
- `main` → code stable validé uniquement
- `develop` → intégration de l'équipe
- `feature/*` → une branche par fonctionnalité

---

## Fonctionnalités implémentées

| # | Fonctionnalité | Statut |
|---|---------------|--------|
| 1 | Authentification JWT + bcrypt | ✅ |
| 2 | Gestion des projets (CRUD + pagination) | ✅ |
| 3 | Gestion des tâches (CRUD + statut) | ✅ |
| 4 | Assignation des tâches aux membres | ✅ |
| 5 | Tableau de bord (agrégation MongoDB) | ✅ |
| 6 | Filtrage, recherche et pagination | ✅ |
| 7 | Sauvegarde automatique des brouillons | ✅ |
| 8 | Gestion des membres d'un projet | ✅ |
| 9 | Historique des activités | ✅ |
| 10 | Notifications + polling | ✅ |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion

### Projets
- `GET /api/projects` — Liste paginée
- `POST /api/projects` — Créer
- `PUT /api/projects/:id` — Modifier
- `DELETE /api/projects/:id` — Supprimer (cascade tâches)
- `POST /api/projects/:id/members` — Inviter un membre
- `DELETE /api/projects/:id/members/:userId` — Retirer un membre
- `GET /api/projects/:id/activities` — Historique

### Tâches
- `GET /api/tasks` — Liste avec filtres + pagination
- `GET /api/tasks/project/:id` — Tâches d'un projet
- `POST /api/tasks` — Créer
- `PUT /api/tasks/:id` — Modifier
- `PATCH /api/tasks/:id/status` — Mettre à jour le statut
- `DELETE /api/tasks/:id` — Supprimer

### Dashboard
- `GET /api/dashboard` — Métriques agrégées

### Notifications
- `GET /api/notifications` — Liste
- `PATCH /api/notifications/:id/read` — Marquer comme lu
