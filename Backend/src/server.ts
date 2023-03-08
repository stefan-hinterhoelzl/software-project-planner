import { initializeApp, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { authenticateJWT } from './auth';
import { createLogger, transports, format } from 'winston';
import * as morgan from 'morgan';
import { createProject, getProjectsByOwner, getProjectById, updateProjectById, deleteProjectById } from './controllers/project.controller';
import { createUser, getUserById } from './controllers/user.controller';
import { addRemoteProjects, getRomoteProjects } from './controllers/remoteproject.controller';
import { addRemoteIssuesToProjectViewpoint, removeRemoteIssuesFromProjectViewpoint, getRemoteIssuesFromProjectViewpoint } from './controllers/issue.controller';
import { createViewpoint, getViewpointsByProject, updateViewpointById, deleteViewpointById, getViewpointById } from './controllers/projectviewpoint.controller';
import * as cors from 'cors';

dotenv.config();

//Initialization
const express_app = express();

export const firebase_app = initializeApp({
  credential: cert({
    privateKey: process.env.FIREBASE_PRIVATE_KEY![0] === '-' ? process.env.FIREBASE_PRIVATE_KEY : JSON.parse(process.env.FIREBASE_PRIVATE_KEY!),
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

//CORS
const allowedOrigins = ['http://localhost:4200'];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

express_app.use(cors(options));

express_app.use(morgan('dev'));
express_app.use(express.json());

//Routes
//Projects
express_app.post('/projects', authenticateJWT, (req, res) => {
  createProject(req, res);
});

express_app.get('/projects/:owner', authenticateJWT, (req, res) => {
  getProjectsByOwner(req, res);
});

express_app.get('/project/:projectId', authenticateJWT, (req, res) => {
  getProjectById(req, res);
});

express_app.put('/project/:projectId', authenticateJWT, (req, res) => {
  updateProjectById(req, res);
});

express_app.delete('/project/:projectId', authenticateJWT, (req, res) => {
  deleteProjectById(req, res);
});

//Users
express_app.post('/users', authenticateJWT, (req, res) => {
  createUser(req, res);
});

express_app.get('/user/:userId', authenticateJWT, (req, res) => {
  getUserById(req, res);
});

//RemoteProjects
express_app.post('/project/:projectId/RemoteProjects', authenticateJWT, (req, res) => {
  addRemoteProjects(req, res);
});

express_app.get('/project/:projectId/RemoteProjects', authenticateJWT, (req, res) => {
  getRomoteProjects(req, res);
});

express_app.delete('/project/:projectId/RemoteProject/:remoteProjectId', authenticateJWT, (req, res) => {
  deleteProjectById(req, res);
});

//ProjectViewpoint

express_app.post('/project/:projectId/Viewpoints', authenticateJWT, (req, res) => {
  createViewpoint(req, res);
});

express_app.get('/project/:projectId/Viewpoints', authenticateJWT, (req, res) => {
  getViewpointsByProject(req, res);
});

express_app.get('/project/:projectId/Viewpoint/:viewpointId', authenticateJWT, (req, res) => {
  getViewpointById(req, res)
});

express_app.put('/project/:projectId/Viewpoint/:viewpointId', authenticateJWT, (req, res) => {
  updateViewpointById(req, res);
});

express_app.delete('/project/:projectId/Viewpoints/:viewpointId', authenticateJWT, (req, res) => {
  deleteViewpointById(req, res);
});

//Issues
express_app.post('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, (req, res) => {
  addRemoteIssuesToProjectViewpoint(req, res);
});

express_app.put('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, (req, res) => {
  removeRemoteIssuesFromProjectViewpoint(req, res);
});

express_app.get('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, (req, res) => {
  getRemoteIssuesFromProjectViewpoint(req, res);
});



//Start the Server
const server = express_app.listen(process.env.PORT, () => {
  console.log('Backend Server started on Port ' + process.env.PORT);
});
