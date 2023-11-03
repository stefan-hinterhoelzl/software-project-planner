ARG PORT=3000

#Build Stage
FROM node:18.18.0-alpine as build
#Set Work Directory
WORKDIR /app
#Copy package.json and package-lock.json
COPY package*.json ./
#Install dependencies
RUN npm install --omit=dev
#Copy the rest
COPY . .
#Build the app
RUN npm run build

#Deploy Stage
FROM nginx
#Tell Docker to Expose the Port
EXPOSE ${PORT}
#Copy the Nginx config to the default location
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
#Copy the built application to the Nginx directory
COPY --from=build /app/dist/software-project-planner /usr/share/nginx/html



