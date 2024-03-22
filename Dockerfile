FROM node:18 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

# Seems to fail for arm64 images if maxsockets is not set to 1. https://github.com/npm/cli/issues/4652#issuecomment-1157594100
RUN npm install --maxsockets 1

COPY . ./

RUN npm run build --prod

FROM nginx:1.23-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/networks.json /usr/share/nginx/html
