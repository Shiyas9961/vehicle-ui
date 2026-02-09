FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY env.sh /docker-entrypoint.d/10-env.sh

RUN chmod +x /docker-entrypoint.d/10-env.sh