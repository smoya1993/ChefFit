FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 👇 build-arg con valor por defecto (por si alguien no pasa nada)
ARG VITE_SERVER_BASE_URL=https://chef-back.cheffit.duckdns.org/api
ARG VITE_CLOUDINARY_PRESET=ml_default
ARG VITE_CLOUDINARY_CLOUD_NAME=dxhp87cqy
ARG VITE_CLOUDINARY_BASE_URL=https://api.cloudinary.com/v1_1/dxhp87cqy/image/upload

ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL
ENV VITE_CLOUDINARY_PRESET=$VITE_CLOUDINARY_PRESET
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_BASE_URL=$VITE_CLOUDINARY_BASE_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
