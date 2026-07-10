# ============================================================
# Strapi v5 本番用 Dockerfile (マルチステージビルド)
# ============================================================
# セキュリティ: 非rootユーザーで実行、最小限のパッケージのみインストール
# 軽量化: Alpine + マルチステージで最終イメージを小さく保つ
# ============================================================

# ---- Stage 1: ビルドステージ ----
FROM node:20-alpine AS build

# ネイティブモジュール（better-sqlite3, sharp等）のビルドに必要な最小限のツール
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev python3

ENV NODE_ENV=production

WORKDIR /opt/

# 依存関係の解決（キャッシュ効率を最大化するため先にコピー）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .

# Strapi管理画面のビルド
RUN npm run build

# ---- Stage 2: 本番実行ステージ ----
FROM node:20-alpine AS production

# ランタイムに必要な最小限のライブラリのみ
RUN apk add --no-cache vips-dev tini \
    && rm -rf /var/cache/apk/*

# セキュリティ: 非rootユーザーの作成と使用
RUN addgroup -g 1001 -S strapi \
    && adduser -S strapi -u 1001 -G strapi

ENV NODE_ENV=production

WORKDIR /opt/

# ビルド済みの node_modules をコピー
COPY --from=build --chown=strapi:strapi /opt/node_modules ./node_modules

WORKDIR /opt/app

# ビルド済みのアプリケーションをコピー
COPY --from=build --chown=strapi:strapi /opt/app ./

# データとアップロードのディレクトリをマウントポイントとして定義
RUN mkdir -p .tmp public/uploads \
    && chown -R strapi:strapi .tmp public/uploads
VOLUME ["/opt/app/.tmp", "/opt/app/public/uploads"]

ENV PATH=/opt/node_modules/.bin:$PATH

# 非rootユーザーに切り替え
USER strapi

EXPOSE 1337

# tini をPID 1として使用（シグナルハンドリングの安全化）
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]
