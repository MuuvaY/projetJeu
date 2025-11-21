🎮 Gestionnaire de Collection de Jeux Vidéo

Une application web complète (Fullstack) permettant de gérer une collection de jeux vidéo personnelle. Ce projet a été réalisé dans le cadre d'un TP pour apprendre les opérations CRUD avec MongoDB, la création d'une API REST avec Node.js/Express, et la consommation de données avec React.

✨ Fonctionnalités

CRUD Complet : Ajouter, consulter, modifier et supprimer des jeux.

Recherche et Filtres : Filtrer par genre, plateforme ou rechercher par titre.

Statistiques : Tableau de bord dynamique (temps de jeu total, nombre de jeux finis, score moyen) utilisant l'Aggregation Framework de MongoDB.

Système de Favoris : Marquer des jeux comme favoris en un clic.

Interface Moderne : UI réactive construite avec React et Tailwind CSS.

Dockerisé : Base de données MongoDB et Mongo Express pré-configurés via Docker Compose.

🛠️ Technologies Utilisées

Backend

Node.js & Express : Serveur API RESTful.

MongoDB : Base de données NoSQL.

MongoDB Driver : Pour la communication native avec la DB.

Frontend

React.js : Bibliothèque UI.

Tailwind CSS : Pour le style.

Lucide React : Pour les icônes.

DevOps

Docker & Docker Compose : Conteneurisation de la base de données.

📂 Structure du Projet

ProjetJeu/

├── backend/ # API Node.js

│ ├── server.js # Point d'entrée et routes

│ └── package.json

├── frontend/ # Interface React

│ ├── public/

│ └── src/ # Composants et logique

├── docker-compose.yml # Configuration MongoDB + Mongo Express

└── init.js # Script d'initialisation de la DB

🚀 Installation et Démarrage

Suivez ces étapes pour lancer le projet sur votre machine locale.

Prérequis

Node.js

Docker Desktop

1. Démarrer la Base de Données

À la racine du projet (/ProjetJeu), lancez les conteneurs Docker :

docker-compose up -d

Cela lancera MongoDB sur le port 27017 et Mongo Express sur le port 8081.

2. Installer et Lancer le Backend

Ouvrez un nouveau terminal et naviguez vers le dossier backend :

cd backend

npm install

node server.js

Le serveur démarrera sur : http://localhost:3000

3. Installer et Lancer le Frontend

Ouvrez un autre terminal et naviguez vers le dossier frontend :

cd frontend

npm install

npm start

Note : Si React vous signale que le port 3000 est occupé (par le backend), tapez y pour utiliser un autre port (ex: 3001).

L'application s'ouvrira dans votre navigateur (généralement http://localhost:3001).

🔌 Documentation de l'API

L'API tourne sur http://localhost:3000/api.

Méthode

Endpoint

Description

GET

/games

Récupérer tous les jeux (supporte query params ?genre= et ?plateforme=)

POST

/games

Ajouter un nouveau jeu

PUT

/games/:id

Modifier un jeu existant

DELETE

/games/:id

Supprimer un jeu

POST

/games/:id/favorite

Basculer l'état favori d'un jeu

GET

/stats

Obtenir les statistiques globales

🐳 Administration Base de Données

Une interface graphique Mongo Express est incluse pour visualiser vos données brutes.

URL : http://localhost:8081

Login : admin

Password : password

📝 Auteur

Réalisé par \[Votre Nom\] dans le cadre du TP MongoDB.
