# 💰 Budget Tracker UI

> Frontend Angular 22 d'une application de gestion budgétaire personnelle — tableaux de bord interactifs, suivi des transactions, connexion bancaire open banking via Tink.

![Angular](https://img.shields.io/badge/Angular-22-dd0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-ff6384?style=flat-square&logo=chartdotjs&logoColor=white)

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Lancer le projet](#lancer-le-projet)
- [Screenshots](#screenshots)
- [Backend](#backend)

---

## Fonctionnalités

### 📊 Dashboard
- 4 cartes de synthèse du mois en cours : balance, revenus, dépenses, épargne nette (depuis `/api/stats/balance`)
- Camembert doughnut des dépenses par catégorie avec couleurs personnalisées (depuis `/api/stats/by-category`)
- Graphique en barres revenus vs dépenses sur les 6 derniers mois (depuis `/api/stats/monthly`)
- Liste des 8 transactions les plus récentes
- Vue d'ensemble des comptes bancaires

### 💸 Transactions
- Tableau paginé — 25 transactions par page, pagination intelligente (`1 … 4 5 [6] 7 8 … 248`)
- Filtres combinés serveur-side : type (Income / Expense), catégorie, période From/To
- Raccourci "Ce mois-ci" pour pré-remplir les dates du mois en cours
- Modification de catégorie inline — dropdown par ligne, appel `PATCH /api/transactions/{id}/category` sans rechargement
- Création de transaction via formulaire modal
- Suppression avec confirmation

### 🏷️ Catégories
- CRUD complet des catégories avec icône et couleur personnalisées

### 🏦 Comptes
- Gestion des comptes bancaires (nom, devise, solde)

### 🏦 Connexion bancaire Tink
- Intégration open banking via Tink Link
- Importation automatique des transactions depuis la banque
- Callback de retour avec bannière de confirmation

### 👤 Profil
- Affichage des informations utilisateur (depuis `/api/users/me`)
- Modification du prénom et du nom avec mise à jour immédiate de la sidebar
- Changement de mot de passe (champ actuel + nouveau + confirmation)
- Messages de succès / erreur auto-effaçants

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | [Angular 22](https://angular.dev) — standalone components, zoneless |
| Langage | TypeScript 6.0 |
| État | Angular Signals (`signal`, `computed`) |
| Graphiques | [Chart.js 4.5](https://www.chartjs.org) — natif, sans wrapper |
| Styles | CSS classique (variables CSS, pas de framework UI) |
| HTTP | `HttpClient` avec intercepteur JWT automatique |
| Routage | Angular Router — lazy loading par page |
| Authentification | JWT stocké en localStorage, guard sur toutes les routes protégées |

---

## Architecture

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # Redirige vers /login si non authentifié
│   ├── interceptors/
│   │   └── jwt.interceptor.ts     # Injecte Bearer token sur toutes les requêtes
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── transaction.model.ts
│   │   ├── category.model.ts
│   │   ├── account.model.ts
│   │   └── stats.model.ts
│   └── services/
│       ├── auth.service.ts        # Login, register, logout, currentUser signal
│       ├── user.service.ts        # GET/PUT /api/users/me
│       ├── transaction.service.ts # CRUD + loadFiltered + patchCategory
│       ├── category.service.ts    # CRUD catégories
│       ├── account.service.ts     # CRUD comptes
│       ├── stats.service.ts       # balance, by-category, monthly
│       └── tink.service.ts        # URL de connexion Tink
│
├── layout/
│   └── layout.component.ts        # Shell : sidebar + <router-outlet>
│
├── shared/
│   ├── sidebar/
│   │   └── sidebar.component.*    # Navigation + lien profil + logout
│   └── charts/
│       ├── pie-chart.component.ts  # Doughnut Chart.js
│       └── bar-chart.component.ts  # Barres groupées Chart.js
│
└── pages/
    ├── auth/
    │   ├── login/
    │   └── register/
    ├── dashboard/                  # Stats + graphiques + transactions récentes
    ├── transactions/               # Tableau filtré + paginé
    ├── categories/
    ├── accounts/
    ├── profile/                    # Infos personnelles + mot de passe
    └── tink/
        └── tink-callback.component.ts
```

### Flux de données (Signals)

```
Service (signal privé) ──► composant.readonly signal ──► template (réactif)
         ▲
    HTTP + tap()
```

Chaque service expose un signal readonly. Les composants ne modifient jamais l'état directement — ils passent par les méthodes du service qui mettent à jour le signal via `tap()`.

---

## Lancer le projet

### Prérequis

- Node.js 20+
- npm 10+
- [Budget Tracker API](https://github.com/your-username/budget-tracker-api) lancée sur `http://localhost:8080`

### Installation

```bash
git clone https://github.com/your-username/budget-tracker-ui.git
cd budget-tracker-ui
npm install
```

### Développement

```bash
ng serve
# → http://localhost:4200
```

### Build production

```bash
ng build
# Output dans dist/budget-tracker-ui/
```

---

## Screenshots

### Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  💼 Balance      📈 Revenus     📉 Dépenses    🎯 Épargne   │
│  €2 340,00       €3 200,00      €860,00         €2 340,00   │
├─────────────────────────────┬───────────────────────────────┤
│  Transactions récentes      │  Dépenses par catégorie       │
│  ─────────────────────────  │  ┌────────────────────────┐   │
│  🍔 Burger King  -€12,50    │  │   [Camembert Chart.js] │   │
│  💊 Pharmacie    -€8,00     │  │  🍔 Nourriture  42%    │   │
│  💼 Salaire      +€2 800    │  │  🚗 Transport   28%    │   │
│  ...                        │  └────────────────────────┘   │
├─────────────────────────────┴───────────────────────────────┤
│  Revenus vs Dépenses — 6 derniers mois [Graphique barres]   │
│  Jan   Fév   Mar   Avr   Mai   Juin                         │
└─────────────────────────────────────────────────────────────┘
```

### Transactions
```
┌──────────────────────────────────────────────────────────────┐
│  Filtres : [Type ▾] [Catégorie ▾] [From] [To]               │
│            [Apply] [Ce mois-ci] [Clear]                      │
├───────────┬──────────────────┬───────────┬───────┬──────────┤
│  Date     │  Description     │  Catégorie│  Type │  Montant │
├───────────┼──────────────────┼───────────┼───────┼──────────┤
│  Jun 13   │  🍔 Burger King  │  [Nourriture ▾]   │  -€12,50 │
│  Jun 12   │  💊 Pharmacie    │  [Santé ▾]        │  -€8,00  │
│  Jun 10   │  💼 Salaire      │  [Revenus ▾]      │  +€2 800 │
├───────────┴──────────────────┴───────────┴───────┴──────────┤
│  ← Précédent   1 … 3 4 [5] 6 7 … 42   Suivant →            │
│                              Page 5 / 42                     │
└──────────────────────────────────────────────────────────────┘
```

### Profil
```
┌─────────────────────────────────────────────────────────────┐
│  AL  Ayoub Legouirah                                        │
│      ayoubgrand060900@gmail.com                             │
├──────────────────────────┬──────────────────────────────────┤
│  ✏️ Infos personnelles   │  🔒 Changer le mot de passe      │
│  ──────────────────────  │  ────────────────────────────    │
│  Prénom  [Ayoub       ]  │  Actuel    [••••••••      👁️]   │
│  Nom     [Legouirah   ]  │  Nouveau   [••••••••      👁️]   │
│  Email   [••••• (lock)]  │  Confirmer [••••••••      👁️]   │
│             [Enregistrer]│           [Modifier le mdp]      │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Backend

Le frontend consomme l'API REST Spring Boot 4 disponible ici :

**→ [budget-tracker-api](https://github.com/your-username/budget-tracker-api)**

L'API tourne par défaut sur `http://localhost:8080`. Pour changer l'URL de base, remplacez `http://localhost:8080` dans les services (`core/services/`).

### Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authentification |
| `POST` | `/api/auth/register` | Inscription |
| `GET` | `/api/users/me` | Profil utilisateur |
| `PUT` | `/api/users/me` | Modifier prénom/nom |
| `PUT` | `/api/users/me/password` | Changer mot de passe |
| `GET` | `/api/transactions` | Transactions (filtres via query params) |
| `POST` | `/api/transactions` | Créer une transaction |
| `PATCH` | `/api/transactions/{id}/category` | Changer la catégorie |
| `DELETE` | `/api/transactions/{id}` | Supprimer |
| `GET` | `/api/stats/balance` | Synthèse du mois |
| `GET` | `/api/stats/by-category` | Dépenses par catégorie |
| `GET` | `/api/stats/monthly` | Historique 6 mois |
| `GET` | `/api/categories` | Liste des catégories |
| `GET` | `/api/accounts` | Liste des comptes |
| `GET` | `/api/tink/connect-url` | URL Tink Link |

---

## Licence

MIT
