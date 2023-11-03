#Node v18 base image
FROM node:18.18.0-alpine AS node

#Build Stage
FROM node as build
#Set Work Directory
WORKDIR /app
#Get required NPM version
RUN npm install -g npm@10.2.3
#Install Git
RUN apk add --no-cache git
#Copy package.json and package-lock.json
COPY package*.json ./
#Install dependencies
RUN npm install
#Copy the rest
COPY . .
#Build the app
RUN npm run build

#Deploy Stage
FROM node as deploy
# Set node environment to production
ENV NODE_ENV production
# Update the system
RUN apk --no-cache -U upgrade
#create directory for the build
RUN mkdir -p /app/build
#Set Work Directory
WORKDIR /app
#Get required NPM version
RUN npm install -g npm@10.2.3
#Install PM2
RUN npm i -g pm2
#Install Git
RUN apk add --no-cache git
#Copy process.yml, package.json and package-lock.json
COPY .env process.yml package*.json ./
#Install prod dependencies
RUN npm i --omit=dev
#Copy compiles JS files from build stage to the deployed dist directory
COPY --from=build /app/build ./build
#RUN API with PM2
ENTRYPOINT [ "pm2-runtime", "./process.yml" ]