dev-server:
	@npm run dev:server

dev-client:
	@npm run dev:client

test:
	@npm run test

start:
	@npm run start

build:
	@npm run build

coverage:
	@npm run coverage

docker-build:
	@docker compose build

docker-run:
	@docker compose up

docker-stop:
	@docker compose down

.PHONY: dev test start build docker-build docker-run docker-stop
