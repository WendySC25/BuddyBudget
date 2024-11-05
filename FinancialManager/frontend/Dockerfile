#dockerfile backend
#nos estamos colgando de la imagen de node para react :)
FROM node:18.19.0 
WORKDIR /app
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set registry https://registry.npmmirror.com/
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start-watch"]
