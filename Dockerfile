# TODO: Obsolete. Replace this by Dockerfile.swarm
FROM node:8-alpine
WORKDIR /app
COPY ./package*.json ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./server ./server
COPY ./assets ./assets
COPY ./node_modules ./node_modules
RUN npm install -g pm2
CMD [ "pm2-runtime", "start", "./bin/www.js"]
EXPOSE 3000
