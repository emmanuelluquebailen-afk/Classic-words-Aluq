# Classic Words — PWA

Jeu de mots style Scrabble EN/FR avec définitions croisées via Claude AI.

## Déploiement sur Vercel (5 minutes)

### Étape 1 — Mettre le projet sur GitHub
1. Va sur https://github.com/new
2. Crée un nouveau repository (ex: `classic-words`)
3. Upload tous les fichiers de ce dossier (drag & drop)

### Étape 2 — Déployer sur Vercel
1. Va sur https://vercel.com et connecte-toi avec GitHub
2. Clique **"Add New Project"**
3. Sélectionne ton repository `classic-words`
4. Vercel détecte automatiquement Vite → clique **Deploy**
5. En ~1 minute tu as une URL du type `https://classic-words-xxxx.vercel.app`

### Étape 3 — Installer sur iPhone
1. Ouvre l'URL dans **Safari** sur ton iPhone
2. Touche le bouton **Partager** (carré avec flèche vers le haut)
3. Fais défiler → **"Sur l'écran d'accueil"**
4. Confirme → l'icône Classic Words apparaît sur ton bureau 🎉

## Développement local

```bash
npm install
npm run dev
```

## Structure
```
classicwords/
├── index.html
├── vite.config.js
├── package.json
├── vercel.json
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── src/
    ├── main.jsx
    └── ClassicWords.jsx
```
