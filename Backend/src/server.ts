import { initializeApp, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { authenticateJWT } from './auth';
import { createLogger, transports, format } from 'winston';
import * as morgan from 'morgan';
import { createProject, getProjectsByOwner, getProjectById, updateProjectById, deleteProjectById } from './controllers/project.controller';
import { createUser, getUserById } from './controllers/user.controller';
import { addRemoteProjects, deleteRemoteProjectById, getRomoteProjects, updateRemoteProjects } from './controllers/remoteproject.controller';
import {
  addRemoteIssuesToProjectViewpoint,
  removeRemoteIssuesFromProjectViewpoint,
  getRemoteIssuesFromProjectViewpoint,
  removeAllIssuesByRemoteProject,
  getSelectedIssuesFromViewpointWithoutRelation,
  getSelectedIssueRelations,
  postSelectedIssueRelations,
  deleteSelectedIssueRelations,
  getRemoteIssuesbyIDs,
} from './controllers/issue.controller';
import {
  createViewpoint,
  getViewpointsByProject,
  updateViewpointById,
  deleteViewpointById,
  getViewpointById,
} from './controllers/projectviewpoint.controller';
import * as cors from 'cors';
import { auth } from 'firebase-admin';
import { detectHierarchies, evaluateTree } from './controllers/tree.controller';

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
express_app.post('/projects', authenticateJWT, createProject);
express_app.get('/projects/:owner', authenticateJWT, getProjectsByOwner);
express_app.get('/project/:projectId', authenticateJWT, getProjectById);
express_app.put('/project/:projectId', authenticateJWT, updateProjectById);
express_app.delete('/project/:projectId', authenticateJWT, deleteProjectById);

//Users
express_app.post('/users', authenticateJWT, createUser);
express_app.get('/user/:userId', authenticateJWT, getUserById);

//RemoteProjects
express_app.post('/project/:projectId/RemoteProjects', authenticateJWT, addRemoteProjects);
express_app.get('/project/:projectId/RemoteProjects', authenticateJWT, getRomoteProjects);
express_app.put('/project/:projectId/RemoteProjects', authenticateJWT, updateRemoteProjects);
express_app.delete('/project/:projectId/RemoteProject/:remoteProjectId', authenticateJWT, deleteRemoteProjectById);

//ProjectViewpoint
express_app.post('/project/:projectId/Viewpoints', authenticateJWT, createViewpoint);
express_app.get('/project/:projectId/Viewpoints', authenticateJWT, getViewpointsByProject);
express_app.get('/project/:projectId/Viewpoint/:viewpointId', authenticateJWT, getViewpointById);
express_app.put('/project/:projectId/Viewpoint/:viewpointId', authenticateJWT, updateViewpointById);
express_app.delete('/project/:projectId/Viewpoints/:viewpointId', authenticateJWT, deleteViewpointById);

//Issues
express_app.post('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, addRemoteIssuesToProjectViewpoint);
express_app.put('/project/:projectId/Viewpoint/:viewpointId/GetRemoteIssues', authenticateJWT, getRemoteIssuesbyIDs); //Dirty but OK, I need the body
express_app.put('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, removeRemoteIssuesFromProjectViewpoint);
express_app.get('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues', authenticateJWT, getRemoteIssuesFromProjectViewpoint);
express_app.get('/project/:projectId/Viewpoint/:viewpointId/RemoteIssuesWithoutRelation', authenticateJWT, getSelectedIssuesFromViewpointWithoutRelation);
express_app.get('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues/Relations', authenticateJWT, getSelectedIssueRelations);
express_app.post('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues/Relations', authenticateJWT, postSelectedIssueRelations);
express_app.delete('/project/:projectId/Viewpoint/:viewpointId/RemoteIssues/Relations', authenticateJWT, deleteSelectedIssueRelations);
express_app.delete('/project/:projectId/RemoteProject/:remoteProjectId/RemoteIssues', authenticateJWT, removeAllIssuesByRemoteProject);


//LogicEndpoints
express_app.put('/project/:projectId/Viewpoints/:viewpointId/EvaluateTree', authenticateJWT, evaluateTree);
express_app.put('/project/:projectId/Viewpoints/:viewpointId/DetectHierarchies', authenticateJWT, detectHierarchies);


//Start the Server
const server = express_app.listen(process.env.PORT, () => {
  console.log('Backend Server started on Port ' + process.env.PORT);
});
