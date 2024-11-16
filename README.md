
# 🌍 Carte Interactive des Artistes Mondiaux 🎶

Bienvenue dans notre projet de **visualisation interactive** qui permet d'explorer la distribution géographique et la popularité des artistes à travers le monde, ainsi que la répartition des genres musicaux par pays ! 

## 📌 Fonctionnalités principales

### Visualisation 1 : Carte interactive des artistes par pays 🗺️🎤

- **Description** : Une carte du monde qui affiche :
  - **Nombre d'artistes** par pays.
  - **Popularité totale** des artistes (nombre de fans).
- **Interactions** :
  - **Survol** d'un pays avec la souris pour voir une boîte d'information contenant le nombre d'artistes et leur popularité totale (ex : 🇫🇷 *France : 300 artistes, 4 000 000 fans*).
  - **Clic** sur un pays pour naviguer vers la **Visualisation 2 : répartition des genres musicaux** dans ce pays.

### Visualisation 2 : Répartition des genres musicaux dans un pays 📊🎸

- **Description** : Un histogramme des genres musicaux populaires dans le pays sélectionné.
  - **Axe X** : genres musicaux (rap, pop, rock, etc.).
  - **Axe Y** : popularité du genre (nombre de fans).
- **Interactions** :
  - **Clic** sur une barre (représentant un genre) pour passer à la **Visualisation 3 : détails des artistes et groupes** pour ce genre.

### Visualisation 3 : Répartition des groupes et artistes par genre 🎤🎶

- **Description** : Un nuage de bulles pour représenter les groupes et artistes du genre sélectionné.
  - **Bulles grandes** pour les groupes.
  - **Bulles petites** pour les artistes solos (liens pour ceux en groupe).
- **Interactions** :
  - **Clic** sur une bulle pour afficher les détails de l'artiste ou du groupe (nombre de fans, pays d'origine, etc.).

## 🔄 Navigation entre les visualisations

- **Carte (Visualisation 1)** ➡️ **Histogramme des genres (Visualisation 2)** : Clic sur un pays.
- **Histogramme des genres (Visualisation 2)** ➡️ **Nuage de bulles (Visualisation 3)** : Clic sur un genre musical.

## 🚀 Objectifs

Ce projet permet d'explorer :

- La **distribution géographique** des artistes.
- Les **genres musicaux populaires** par pays.
- Les **groupes et artistes clés** dans chaque genre.

## Setup

### API (Backend)

1. **Cloner le dépôt** :

    ```bash
    git clone https://github.com/ITSsghir/UX_Project.git`
    ```

2. **Installer les dépendances** :

    ```bash
    cd UX_Project

    cd api/

    # Créer un environnement virtuel
    pip install virtualenv
    virtualenv venv
    # Sur Windows : .\venv\Scripts\activate
    venv\Scripts\activate
    # Sur Linux/Mac : source venv/bin/activate

    # Installer les dépendances
    pip install pip-tools
    pip-compile requirements.in
    pip-sync
    ```

3. **Lancer l'API** :

    > **Remarque** : vous devez être dans le dossier `api/` pour lancer l'API.

    ```bash
    # On le lance en mode module pour éviter les problèmes de chemin
    python -m services.api
    ```

4. **Tester l'API** :

    - Exécuter des requêtes HTTP sur `http://localhost:8000`.
    - Exemple : `http://localhost:8000/artists-by-genre-in-country?country=France&genre=EBM`
      - Remplacer `France` par le pays souhaité.
      - Remplacer `EBM` par le genre musical souhaité.
  
    Exemple de requête :
  
    ```bash
    curl http://localhost:8000/artists-by-genre-in-country?country=France&genre=EBM
    ```

    Exemple de réponse :
  
    ```json
    {
        "genre": "EBM",
        "artists": [
            {
              "name": "A Broken Silence",
              "number_of_songs": 25,
              "number_of_albums": 2,
              "deezer_fans": 767,
              "country": "Unknown"
          },
          {
              "name": "A Gun Called Tension",
              "number_of_songs": 12,
              "number_of_albums": 1,
              "deezer_fans": 5,
              "country": "United States"
          },
        ]
    }
    ```

### Frontend

Not implemented yet.
