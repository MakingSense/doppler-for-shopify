FROM node:8-alpine
WORKDIR /app
COPY ./package*.json ./
COPY ./bin ./bin
COPY ./config ./config
COPY ./server ./server
COPY ./assets ./assets
RUN yarn install
CMD yarn start
EXPOSE 3000
