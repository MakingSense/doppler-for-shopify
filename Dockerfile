FROM node:8-alpine
WORKDIR /app
COPY ./package*.json ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./server ./server
COPY ./assets ./assets
RUN npm install -g pm2
RUN yarn install
CMD yarn start-prod
EXPOSE 3000
