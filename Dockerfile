FROM node:latest

WORKDIR /app

# copiem els arxius de dependències
COPY package.json package-lock.json ./
RUN npm install

# copiem el codi de l'aplicació i compilem el programa
COPY . .
RUN npm run build
# indiquem que podem exposar el port del servidor
EXPOSE 8080

# definim el comandament "npm start" que s'executarà quan arranquem el contenidor
CMD ["npm", "start"]