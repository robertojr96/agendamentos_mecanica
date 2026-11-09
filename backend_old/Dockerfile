FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY tsconfig.json prisma7.config.ts ./
COPY prisma ./prisma
COPY src ./src

# URL fictícia só para o generate não reclamar; o valor real vem do Secret em runtime
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]