FROM node:20-alpine AS build

RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev python3

ENV NODE_ENV=production

WORKDIR /opt/

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .

RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache vips-dev tini \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S strapi \
    && adduser -S strapi -u 1001 -G strapi

ENV NODE_ENV=production

WORKDIR /opt/

COPY --from=build --chown=strapi:strapi /opt/node_modules ./node_modules

WORKDIR /opt/app

COPY --from=build --chown=strapi:strapi /opt/app ./

RUN mkdir -p .tmp public/uploads \
    && chown -R strapi:strapi .tmp public/uploads
VOLUME ["/opt/app/.tmp", "/opt/app/public/uploads"]

ENV PATH=/opt/node_modules/.bin:$PATH

USER strapi

EXPOSE 1337

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]
