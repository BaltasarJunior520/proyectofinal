FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar archivos de empaquetado para instalar dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de NestJS
EXPOSE 3000

# Ejecutar en modo desarrollo
CMD ["npm", "run", "start:dev"]
