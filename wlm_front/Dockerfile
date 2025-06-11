FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install @rollup/rollup-linux-x64-gnu --save-optional

RUN npm install 

COPY . .

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"] 