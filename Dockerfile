FROM node:24-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

CMD ["npm", "run", "dev:server"]