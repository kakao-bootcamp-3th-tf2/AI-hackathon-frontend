ARG ENV_FILE=.env.local

FROM node:20-bullseye-slim AS deps
WORKDIR /app

# Prepare pnpm for installation
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Install dependencies declared by pnpm lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-bullseye-slim AS builder
ARG ENV_FILE
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN if [ -f "${ENV_FILE}" ]; then cp "${ENV_FILE}" .env; else touch .env; fi

RUN corepack enable && corepack prepare pnpm@9.12.2 --activate \
 && pnpm build

FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

EXPOSE 3000

CMD ["pnpm", "start"]
