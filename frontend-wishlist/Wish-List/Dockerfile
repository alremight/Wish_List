# Этап 1: сборка приложения
FROM node:16-alpine AS build

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json (если он есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем приложение для продакшена (будет создана папка build)
RUN npm run build


# Этап 2: раздача статики с помощью Nginx
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки в папку, где Nginx ожидает статику
COPY --from=build /app/dist /usr/share/nginx/html

# Если нужно, можно заменить дефолтный конфиг Nginx (опционально)
 COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 (порт по умолчанию для Nginx)
EXPOSE 80

# Запускаем Nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]
