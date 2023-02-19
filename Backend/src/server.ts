import { initializeApp, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv'
import * as express from 'express'
import { authenticateJWT } from './auth'
import { createLogger, transports, format } from "winston";
import * as morgan from 'morgan';
import { createProject } from './controllers/project.controller';



dotenv.config()


//Initialization
const express_app = express();

export const firebase_app = initializeApp({
    credential: cert({
        privateKey: process.env.FIREBASE_PRIVATE_KEY![0] === '-' ? process.env.FIREBASE_PRIVATE_KEY:JSON.parse(process.env.FIREBASE_PRIVATE_KEY!),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),  
});

export const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
});

express_app.use(morgan('dev'));
express_app.use(express.json())


//Routes
express_app.post('/project', authenticateJWT,  (req, res) => {
  createProject(req, res)
})



//Start the Server
const server = express_app.listen(process.env.PORT, () => {
    console.log("Backend Server started on Port "+process.env.PORT)
});