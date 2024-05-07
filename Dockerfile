# Використовуємо лінукс алпайн з версикй ноуд 14
FROM node:20.5.0-alpine

# Вказуємо нашу робочу дирексторію
WORKDIR /app

#Копіюємо server/package.json і server/package-lock.json
COPY package*.json ./

#Втановлення залежностей
RUN npm install

#Копіювання того що залишилось
COPY . .

#Встановити Prisma
RUN npm install -g prisma

#Генереція Prisma client
RUN prisma generate

#Копіюжме прізма схема
COPY prisma/schema.prisma ./prisma/

#Відкриваємо порт 3000 в нашому контейнері
EXPOSE 3000

#Запуск сервера
CMD [ "npm", "start" ]

