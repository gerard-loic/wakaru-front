Quelle commande taper pour tester le projet ? pour le compiler ?
Read package.json
Le package.json ne définit que quatre scripts, il n'y a pas de tests configurés dans ce projet.

Compiler / build

pnpm build
Lance vite build. Pour vérifier en plus le typage TypeScript (non fait par le build Vite par défaut) :


pnpm exec tsc --noEmit
Prévisualiser le build

pnpm preview
Formater le code

pnpm format
Lance oxfmt.

À noter
Le serveur de dev (pnpm dev) tourne déjà, pas besoin de le relancer.
Aucun framework de test (Vitest, Jest…) n'est installé. Si tu veux pouvoir « tester » le projet, il faut d'abord ajouter Vitest et un script test