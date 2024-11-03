#dockerfile backend
#nos estamos colgando de la imagen de node para react :)
FROM node:18.19.0 
WORKDIR /app

RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set registry https://registry.npmmirror.com/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
