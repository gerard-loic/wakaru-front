# Développement

**arrêter une éventuelle instance déjà lancée**
pkill -f 'vite'

**lancer le serveur de dev (PORT par défaut 8443)**
node_modules/.bin/vite --host 0.0.0.0

http://localhost:8443 ou autre



# En production 
git pull
make up

Pour arrêter :

make down

Pour tester le build de l'image en local avant de pousser sur le serveur :


docker build -t wakaru-front:test .
docker run --rm -p 8080:80 wakaru-front:test
# http://localhost:8080