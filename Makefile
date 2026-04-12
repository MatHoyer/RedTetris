postgres:
	docker compose -f docker-compose-infra.yml up -d

dev:
	@npm run dev:server & npm run dev:client & wait

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

lint:
	@npm run lint

lint-fix:
	@npm run lint:fix

format:
	@npm run format

format-check:
	@npm run format:check

docker-build:
	@docker compose build

docker-run:
	@docker compose -f docker-compose-infra.yml up -d
	@docker compose up --build

docker-stop:
	@docker compose down
	@docker compose -f docker-compose-infra.yml down

.PHONY: postgres dev dev-server dev-client test start build coverage lint lint-fix format format-check docker-build docker-run docker-stop
