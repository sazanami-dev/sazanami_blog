# ============================================================
# Astro SSR 本番用 Dockerfile (マルチステージビルド)
# ============================================================
# セキュリティ: 非rootユーザーで実行、ビルドツールを最終イメージに含めない
# 軽量化: Alpine + マルチステージで最終イメージを極小化
# ============================================================

# ---- Stage 1: 依存関係のインストール ----
FROM node:22-alpine AS deps

# sharp のネイティブビルドに必要
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# ---- Stage 2: ビルドステージ ----
FROM node:22-alpine AS build

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド時に必要な環境変数（ダミー値でOK：SSRは実行時に.envを読む）
ENV NODE_ENV=production

RUN npm run build

# 本番用の依存関係のみを再インストール（devDependenciesを除外して軽量化）
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 3: 本番実行ステージ ----
FROM node:22-alpine AS production

# tini: PID 1でのシグナルハンドリング安全化
RUN apk add --no-cache tini \
    && rm -rf /var/cache/apk/*

# セキュリティ: 非rootユーザーの作成と使用
RUN addgroup -g 1001 -S astro \
    && adduser -S astro -u 1001 -G astro

ENV NODE_ENV=production

WORKDIR /app

# 必要最小限のファイルのみコピー（ソースコードは含めない）
COPY --from=build --chown=astro:astro /app/dist ./dist
COPY --from=build --chown=astro:astro /app/node_modules ./node_modules
COPY --from=build --chown=astro:astro /app/package.json ./package.json

# 非rootユーザーに切り替え
USER astro

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# tini をPID 1として使用
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server/entry.mjs"]
