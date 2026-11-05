.PHONY: up down

# Construit l'image et lance le conteneur en arrière-plan
up:
	docker compose up -d --build

# Arrête et supprime le conteneur
down:
	docker compose down
