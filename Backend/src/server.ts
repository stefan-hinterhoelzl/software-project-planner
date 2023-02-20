import { initializeApp, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { authenticateJWT } from './auth';
import { createLogger, transports, format } from "winston";
import * as morgan from 'morgan';
import { createProject, getProjectsByOwner, getProjectById, updateProjectById, deleteProjectById } from './controllers/project.controller';
import { createUser, getUserById } from './controllers/user.controller';
import { addRemoteProjects } from './controllers/remoteproject.controller';



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
//Projects
express_app.post('/projects', authenticateJWT,  (req, res) => {
  createProject(req, res)
})

express_app.get('/projects/:owner', authenticateJWT, (req, res) => {
  getProjectsByOwner(req, res)
})

express_app.get('/project/:id', authenticateJWT, (req, res) => {
  getProjectById(req, res)
})

express_app.put('/project/:id', authenticateJWT, (req, res) => {
  updateProjectById(req, res)
})

express_app.delete('/project/:id', authenticateJWT, (req, res) => {
  deleteProjectById(req, res)
})


//Users
express_app.post('/users', authenticateJWT, (req, res) => {
  createUser(req, res)
})

express_app.get('users' , authenticateJWT, (req, res) => {
  getUserById(req, res)
})


//RemoteProjects
express_app.post('/project/:projectId/RemoteProjects', authenticateJWT, (req, res) => {
  addRemoteProjects(req, res)
})





//Start the Server
const server = express_app.listen(process.env.PORT, () => {
    console.log("Backend Server started on Port "+process.env.PORT)
});