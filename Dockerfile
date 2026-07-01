FROM node:20-alpine

WORKDIR /app

# Copiar archivos de paquetes (mejor cache de capas)
COPY package*.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Instalar todas las dependencias (workspaces incluidos)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar cliente (Vite)
RUN cd client && npm run build

# Compilar servidor (TypeScript)
RUN cd server && npm run build

# Puerto por defecto (Railway inyecta PORT via variable de entorno)
EXPOSE 4000

# Arrancar el servidor
CMD ["node", "server/dist/index.js"]
