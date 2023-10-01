FROM node:18.18.0-alpine as build
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build


FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/software-project-planner /usr/share/nginx/html
