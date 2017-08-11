# JSFight
SUPINFO Web project

## Développeurs
Pierre LAVALLEY

Arnold RONDEL

Kiran MORIN

## Principe
Il s'agit d'un stick fighter. Le joueur contrôle un personnage et doit
combattre un adversaire en lui portant différents coups et coups spéciaux.
Un classement est établit et mis à jour à l'issue de chaque partie.
L'utilisateur peur voir les autres joueurs connectés en direct et leur
proposer de jouer une partie. Le joueur sollicité peut accepter ou non
la requête.

## Installation

### Installer MongoDB

**Sur Linux** : https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

**Lancer le serveur MongoDB**

`mongod --dbpath <chemin_du_projet>/data`

### Installer NodeJS
Installer NodeJS avec NPM.

Une fois fait, installer les dépendances :

`npm install`

Puis lancer le serveur :

`node app.js`

L'app tourne sur le port 3000 par défaut. Ouvrir un navigateur à l'adresse :

http://localhost:3000

### Design, template & contrôles
La vue utilise l'extension .ejs et est développé en HTML5 et CSS3.
Les animations et fonctionnalités sont codées en javascript natif, le jQuery
étant interdit par le cahier des charges comme toute autre extension.
