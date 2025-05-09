FROM node:22-alpine AS base


FROM base AS deps

WORKDIR /app

# copiem els arxius de dependències
COPY package.json package-lock.json ./
RUN npm ci


FROM base AS builder

# copiem el codi de l'aplicació i les dependències i compilem el programa
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build


FROM base AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# definim el comandament "npm start" que s'executarà quan arranquem el contenidor
CMD ["node", "dist/index.js"]