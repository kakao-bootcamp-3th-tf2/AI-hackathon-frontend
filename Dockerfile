# deps
FROM node:20-alpine AS deps

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

WORKDIR /app

# 의존성 파일만 먼저 복사 (레이어 캐싱 최적화)
COPY package.json pnpm-lock.yaml ./

# 프로덕션 의존성만 설치
RUN pnpm install --no-frozen-lockfile --prod

# build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 개발 의존성 포함 전체 설치
RUN pnpm install --no-frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드 인자로 환경 변수 수신
ARG NODE_ENV
ARG NEXT_PUBLIC_API_BASE_URL

# Next.js 빌드
ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# run
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안: non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 빌드 결과물 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 파일 소유권 변경
RUN chown -R nextjs:nodejs /app

# non-root 사용자로 전환
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
