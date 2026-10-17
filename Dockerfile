
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://ecommerce_user:build_placeholder@localhost:5432/ecommerce_db?schema=public" npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
