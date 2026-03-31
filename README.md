# Labo web — environnement A/B testing

## Objectif du projet

Ce dépôt sert à **préparer un environnement de travail** avec un **serveur web** et des pages de démonstration, dans le cadre d’un projet visant à **industrialiser une solution d’A/B testing** (intégration progressive, tests de charge perçue, validation technique avant passage en production).

Le monorepo regroupe une application **host** (Vite + React), un **remote** Module Federation minimal, un paquet UI partagé et un **serveur Node** (Express) pour servir les builds et **simuler des contraintes réseau**.

## Pages principales et URLs

### Pages React (application host)

En développement, l’interface est servie par Vite sur le **port 5173** :

| Page                                               | URL (dev)                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| Accueil (liens vers les démos)                     | [http://localhost:5173/](http://localhost:5173/)                     |
| Démo « rapide » (page légère)                      | [http://localhost:5173/demo/fast](http://localhost:5173/demo/fast)   |
| Démo « lourde » (contenu plus lourd, lazy loading) | [http://localhost:5173/demo/heavy](http://localhost:5173/demo/heavy) |

### Page clonée (OVHcloud)

Une **copie statique** de la page publique **Bare Metal** d’**[OVHcloud](https://www.ovhcloud.com/fr/bare-metal/)** est servie sous le préfixe **`/ovh-bare-metal/`** (HTML, CSS, images miroir local). Elle permet de tester le chargement et le throttle sur un site réel volumineux, **sans** dépendre du site en production une fois le snapshot généré.

| Page                                 | URL (dev, Vite)                                                                | URL (via serveur Node, port 3000)                                              |
| ------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Clone statique OVHcloud (bare-metal) | [http://localhost:5173/ovh-bare-metal/](http://localhost:5173/ovh-bare-metal/) | [http://127.0.0.1:3000/ovh-bare-metal/](http://127.0.0.1:3000/ovh-bare-metal/) |

**Prérequis** : le dossier `apps/host/public/ovh-bare-metal` doit contenir les fichiers du snapshot. Pour le (re)générer à partir du site source (usage interne / test uniquement ; respecter les conditions d’utilisation du site) :

```bash
mkdir -p apps/host/public/ovh-bare-metal
wget -E -H -k -p -nd -P apps/host/public/ovh-bare-metal \
  "https://www.ovhcloud.com/fr/bare-metal/"
npm run fix:ovh
```

Puis rebuild du host si besoin : `npm run build -w @hackathon/host` (pour recopier `public` dans `dist`). Le script `fix:ovh` corrige les noms de fichiers et le HTML pour que le clone s’affiche correctement en local.

## Simulation de bande passante

Le **serveur Node** peut limiter le **débit des réponses HTTP** pour reproduire une liaison lente (3G, réseau saturé, etc.) et observer le comportement des pages et du chargement des ressources.

- **Variable d’environnement** : `THROTTLE_KBPS` — débit maximal en **kilo-octets par seconde** (`0` = aucune limite).

  Exemples **indicatifs** (ordre de grandeur pour la simulation locale ; les débits réels varient fortement selon l’opérateur, la charge et le lieu) :

  | Contexte (téléchargement typique) |       `THROTTLE_KBPS` (ko/s) |
  | --------------------------------- | ---------------------------: |
  | 2G / EDGE                         |                        15–40 |
  | 3G                                |                      100–300 |
  | 4G LTE                            |                    1500–4000 |
  | 5G (gros débit)                   | 8000+ ou `0` (pas de limite) |
  | ADSL (quelques Mbit/s)            |                     400–1000 |
  | VDSL / fibre (ordre de grandeur)  |                    3000–6000 |

  Pour un scénario « mobile 3G », `THROTTLE_KBPS=200` ou `250` est souvent un bon point de départ.

- **En développement uniquement** : routes `GET` et `POST` **`/__dev/throttle`** pour lire ou modifier la limite à chaud (JSON : `{"throttleKbps": 50}`). Ces routes sont **désactivées** si `NODE_ENV=production`.
- **Ouvrir la démo sur `http://localhost:5173`** : le serveur Express (port 3000) ne voit pas ces requêtes ; le même `THROTTLE_KBPS` du `.env` racine est donc appliqué côté **Vite** en dev ([`apps/host/vite-plugin-dev-throttle.ts`](apps/host/vite-plugin-dev-throttle.ts)), pour que JS/CSS/chunks soient réellement ralentis. Redémarrer le dev du host après changement. Le client Vite (`/@vite/`, refresh) est exclu pour garder le dev utilisable.
- **Passer par `http://127.0.0.1:3000`** (proxy vers Vite) : la limitation est assurée **uniquement** par le serveur Node ; Vite ne re-throttle pas (en-tête interne) pour éviter un double ralentissement.
- **Remote Module Federation** (`:5001`) : le navigateur charge ce JS **directement** depuis le remote — ce flux **n’est pas** limité par le throttle du host ni par défaut par le serveur 3000.

Détails d’implémentation : [server/src/throttle.ts](server/src/throttle.ts).

## Installation

**Prérequis** : Node.js **20+** (npm inclus).

À la racine du dépôt :

```bash
npm install
```

Si npm affiche `Unknown env config "devdir"`, c’est en général une variable `npm_config_devdir` injectée par l’environnement : le dépôt configure le terminal intégré VS Code / Cursor pour la retirer ([`.vscode/settings.json`](.vscode/settings.json)). Sinon : `unset npm_config_devdir` (Linux/macOS), ou en dernier recours : `node scripts/npm.mjs install` ([`scripts/npm.mjs`](scripts/npm.mjs) relance npm sans cette variable).

Copiez éventuellement [`.env.example`](.env.example) vers `.env` et adaptez les valeurs.

## Configurer le serveur pour une faible bande passante

1. **Au démarrage** : le serveur charge automatiquement le fichier **`.env` à la racine du dépôt** (voir [`.env.example`](.env.example)). Y mettre par exemple `THROTTLE_KBPS=64` pour environ 64 ko/s en sortie. Un fichier **`.env.local`** (même racine) est aussi pris en charge et **écrase** les valeurs du `.env` ; il reste hors Git grâce au motif `*.local`. Redémarrer le serveur après modification de ces fichiers.
   - Alternative : variable dans le shell pour la session, p.ex. `THROTTLE_KBPS=64 npm run dev -w @hackathon/server`.
2. **Sans redémarrer (mode dev)** : avec le serveur déjà lancé, envoyer une requête POST :
   ```bash
   curl -s -X POST http://127.0.0.1:3000/__dev/throttle \
     -H "Content-Type: application/json" \
     -d '{"throttleKbps": 50}'
   ```
   Consulter la valeur actuelle : `GET http://127.0.0.1:3000/__dev/throttle`.

Le serveur écoute par défaut sur le **port 3000** (`PORT` modifiable). La limitation s’applique au trafic servi par ce serveur (static, proxy vers Vite si le build host n’existe pas encore, etc.).

## Lancement en développement

Lancer **en parallèle** le remote Module Federation (port **5001**), le host Vite (port **5173**) et le serveur Express (port **3000**) :

```bash
npm run dev
```

- Application React (HMR) : **http://localhost:5173/**
- Même expérience via le serveur unifié (utile pour throttle + `/ovh-bare-metal/`) : **http://127.0.0.1:3000/**

Build puis exécution « production » locale :

```bash
npm run build
npm start
```

---

## Ressources complémentaires (référence rapide)

- **Feature flags** : [apps/host/public/feature-flags.json](apps/host/public/feature-flags.json)
- **Module Federation** : host [apps/host/vite.config.ts](apps/host/vite.config.ts), remote [apps/abtest-remote/vite.config.ts](apps/abtest-remote/vite.config.ts)
- **Plugin Vite (clone OVH en dev)** : [apps/host/vite-plugin-ovh-static.ts](apps/host/vite-plugin-ovh-static.ts)

Variables utiles : voir [.env.example](.env.example) (`PORT`, `THROTTLE_KBPS`, `VITE_ABTEST_REMOTE_URL`).
