FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_HOMEY_CLIENT_ID
ARG VITE_HOMEY_CLIENT_SECRET
ARG VITE_HOMEY_REDIRECT_URI
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 9999
