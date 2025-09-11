# --- ETAPA 1: Construcción (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# El '/api' es importante para que el proxy de Nginx funcione
# Si usas otro nombre de variable en tu código Vite, ajústalo aquí.
ENV VITE_API_URL=/api
RUN npm run build

# --- ETAPA 2: Servidor (Server) ---
# Usamos Nginx, un servidor web ligero y de alto rendimiento
FROM nginx:stable-alpine

# Copiamos los archivos estáticos de React desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Reemplazamos la configuración por defecto de Nginx con la nuestra
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80, el estándar para tráfico web
EXPOSE 80

# Nginx se inicia automáticamente