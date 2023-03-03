import { getAuth }from 'firebase-admin/auth'
import { Request, Response } from 'express';
import { firebase_app } from './server'
import { logger } from './server'
import { checkProjectAccess } from './controllers/project.controller';

export const authenticateJWT = async (req: Request, res: Response, next: any) => {
    const auth = getAuth(firebase_app)
    const authHeader = req.headers.authorization;
    console.log(req.params)

    if (authHeader) {
      const idToken = authHeader.split(" ")[1];
        auth.verifyIdToken(idToken)
        .then(async (decodedToken) => {

            //various security checks for accessing ressources
            let time: number = Math.round(Date.now() / 1000);

            if (time > decodedToken.exp) {
                logger.warn("Expired Token Declined")
                return res.sendStatus(401).json({message:"Token expired"})
            } 

            //User route invoked -- check for access to called user
            else if (req.url.startsWith("http://localhost:3000/user", 0)) {
              let userIdURL: string = req.params["userId"];
              let userIdToken: string = decodedToken.uid

              if (userIdToken !== userIdURL) {
                logger.warn("Cross User Modification hindered")
                return res.sendStatus(401).json({message: "Stopped modification of other User!"})
              }
            }

            //Project route invoked -- check for acces to called project
            else if (req.url.startsWith("http://localhost:3000/project/", 0)) {
              let projectId: string = req.params["userId"];
              let userIdToken: string = decodedToken.uid;
              let access: boolean = await checkProjectAccess(projectId, userIdToken)
              if (!access) {
                logger.warn("Cross Project access hindered")
                return res.sendStatus(401).json({message: "Cross Project access detected!"})
              }
            }

            //All Project route
            else if (req.url.startsWith("http://localhost:3000/projects/", 0)) {
              let userIdURL: string = req.params["userId"];
              let userIdToken: string = decodedToken.uid

              if (userIdToken !== userIdURL) {
                logger.warn("Querying of projects hindered")
                return res.sendStatus(401).json({message: "Stopped unauthorized access to projects!"})
              }
            }
            
          else return next();
        })
        .catch(function (error) {
          logger.warn("Invalid Token Declined")
          return res.sendStatus(403).json({message:"Token invalid"});
        });
    } else {
      res.sendStatus(401).json({message:"Auth header is missing in the request"});
      logger.warn("Missing Auth Header Declined")
    }
    
};


