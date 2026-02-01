FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 👇 build-arg con valor por defecto (por si alguien no pasa nada)
ARG VITE_SERVER_BASE_URL=https://chef-back.cheffit.duckdns.org/api
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
