FROM node:20-bullseye

WORKDIR /app

RUN npm i --no-save prisma@5.17.0

COPY prisma prisma

CMD ["npx", "prisma", "migrate", "deploy"]
