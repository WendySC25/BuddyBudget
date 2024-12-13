#Dockerfile from Frontend
FROM node:18.19.0

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install react-slider

COPY . .

EXPOSE 3000
CMD ["npm", "start"]

