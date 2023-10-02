import { getAuth } from 'firebase-admin/auth';
import { Request, Response } from 'express';
import { firebase_app } from './server';
import { logger } from './server';
import { checkProjectAccess } from './controllers/project.controller';

export const authenticateJWT = async (req: Request, res: Response, next: any) => {
  const auth = getAuth(firebase_app);
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const idToken = authHeader.split(' ')[1];
    auth
      .verifyIdToken(idToken)
      .then(async decodedToken => {
        //various security checks for accessing ressources
        let time: number = Math.round(Date.now() / 1000);

        if (time > decodedToken.exp) {
          logger.warn('Expired Token Declined');
          return res.status(401).json({ message: 'Token expired' });
        }

        //Project route invoked -- check for acces to called project
        else if (req.url.startsWith('/project', 0)) {
          let projectId: string = req.params['userId'];
          let userIdToken: string = decodedToken.uid;
          let access: boolean = await checkProjectAccess(projectId, userIdToken);
          if (!access) {
            logger.warn('Cross Project access hindered');
            return res.status(401).json({ message: 'Cross Project access detected!' });
          } else return next();
        }

        //All Project route
        else if (req.url.startsWith('/projects', 0)) {
          let userIdURL: string = req.params['userId'];
          let userIdToken: string = decodedToken.uid;

          if (userIdToken !== userIdURL) {
            logger.warn('Querying of projects hindered');
            return res.status(401).json({ message: 'Stopped unauthorized access to projects!' });
          } else return next();
        } else {
          return next();
        }
      })
      .catch(function (error) {
        logger.warn('Invalid Token Declined');
        return res.status(403).json({ message: 'Token invalid' });
      });
  } else {
    res.status(401).json({ message: 'Auth header is missing in the request' });
    logger.warn('Missing Auth Header Declined');
  }
};
