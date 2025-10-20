FROM node:20-bullseye AS builder

WORKDIR /app 

COPY package*.json .
COPY nest-cli.json .
COPY tsconfig* .

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-bullseye AS final

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
