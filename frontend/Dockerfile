#Dockerfile from Frontend
FROM node:18.19.0 AS build

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 120000 && npm install --prefer-offline

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
