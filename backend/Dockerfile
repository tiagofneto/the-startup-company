FROM node:18

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app

EXPOSE 3000

CMD ["node", "src/index.mjs"]
