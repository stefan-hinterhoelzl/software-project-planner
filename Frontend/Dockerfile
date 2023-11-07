#Build Stage
FROM node:18.18.0-alpine as build
#Update
RUN apk --no-cache -U upgrade
#Set Work Directory
WORKDIR /app
#Copy package.json and package-lock.json
COPY package*.json ./
#Install prod dependencies
RUN npm install --omit=dev
#Copy the rest
COPY . .
#Build the app
RUN npm run build

#Deploy Stage
FROM nginx
#Copy the Nginx config to the default location
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
#Copy the built application to the Nginx directory
COPY --from=build /app/dist/software-project-planner /usr/share/nginx/html



