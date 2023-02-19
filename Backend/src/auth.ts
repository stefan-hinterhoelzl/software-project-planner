import { getAuth }from 'firebase-admin/auth'
import { firebase_app } from './server'
import { logger } from './server'

export const authenticateJWT = async (req: any, res: any, next: any) => {
    const auth = getAuth(firebase_app)
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const idToken = authHeader.split(" ")[1];
        auth.verifyIdToken(idToken)
        .then((decodedToken) => {
          return next();
        })
        .catch(function (error) {
          logger.warn("Invalid Token Declined")
          return res.sendStatus(403);
        });
    } else {
      res.sendStatus(401);
      logger.warn("Missing Auth Header Declined")
    }
};


