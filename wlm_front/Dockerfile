# Node.js를 사용하여 빌드
FROM node:18 AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build

# Nginx로 정적 파일 서빙
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL 인증서 복사
COPY ./etc/keys/self.crt /etc/nginx/ssl/self.crt
COPY ./etc/keys/self.key /etc/nginx/ssl/self.key

# 환경 변수 설정
# ENV PORT=80
ENV PORT=443
# EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"] 
