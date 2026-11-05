Depuis la racine du projet, lance Vite directement :


node_modules/.bin/vite --host 0.0.0.0
L'application sera accessible sur http://localhost:8443.

Changer de port : PORT=3000 node_modules/.bin/vite --host 0.0.0.0. Le port est défini en mode strict (strictPort) : si 8443 est déjà occupé, Vite s'arrête au lieu de passer à un autre port.
Arrêter une instance déjà lancée : pkill -f vite
Après une modification de .env (par exemple VITE_SYLO_BASE_URL), il faut redémarrer le serveur, car ces variables ne sont lues qu'au démarrage. Les fichiers source, eux, se rechargent automatiquement.
Le backend : il doit tourner sur http://wakaru-api.diatem.local et renvoyer les en-têtes CORS pour l'origine du front.
pnpm dev est la commande normale, mais elle échoue actuellement sur ta machine : la version de pnpm fixée dans .mise.toml (10.34.3) n'est pas reconnue comme fiable. Si tu corriges ça, pnpm dev fera la même chose que la commande ci-dessus.
-----------------------------------------------

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