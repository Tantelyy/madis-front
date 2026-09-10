FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BACKEND_URL=/api
ARG VITE_MADIS_LOGO_PATH=/branding/madis-logo.png
ARG VITE_MADIS_SLOGAN="SMART CHOICE, BETTER LIFE"
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_MADIS_LOGO_PATH=$VITE_MADIS_LOGO_PATH \
    VITE_MADIS_SLOGAN=$VITE_MADIS_SLOGAN

RUN npm run build

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1

