# 1️⃣ Node.js를 사용하여 빌드
FROM node:18 AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build

# 2️⃣ Nginx로 정적 파일 서빙
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 환경 변수 설정
ENV PORT=80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 