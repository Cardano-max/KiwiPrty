# Kiwi Party web — production container.
# Build context is apps/web. SQLite lives in the container (re-seeded on start),
# so it runs anywhere with zero external services. For multi-instance / durable
# data, point DATABASE_URL at Postgres and change the Prisma provider.

FROM node:22-slim

WORKDIR /app

# OpenSSL is required by Prisma's query engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps (schema is copied first so the postinstall `prisma generate` works).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Build the app.
COPY . .
RUN npm run build

ENV DATABASE_URL="file:./prod.db"
ENV JWT_SECRET="change-me-in-production"
ENV PORT=3000
EXPOSE 3000

# On start: sync the schema, seed demo data, then serve.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && node_modules/.bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
