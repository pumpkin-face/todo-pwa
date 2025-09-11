# --- ETAPA 1: Construcción (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json para instalar todas las dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente del proyecto
COPY . .

# Compilamos TypeScript a JavaScript
RUN npm run build

# --- ETAPA 2: Producción ---
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json de nuevo para instalar solo las dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponemos el puerto que usa el servidor
EXPOSE 5000

# El comando final para iniciar el server
CMD [ "node", "dist/server.js" ]