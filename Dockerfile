FROM node:18 AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

RUN yarn run build --prod

FROM nginx:1.23-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/networks.json /usr/share/nginx/html
