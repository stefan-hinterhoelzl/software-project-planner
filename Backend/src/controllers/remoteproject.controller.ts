import { Request, Response } from 'express';
import { connect } from '../database';
import { RemoteProject } from '../models/remoteProjects';
import { handleError } from './controller.util';

export async function addRemoteProjects(req: Request, res: Response) {
  var id: string = req.params.projectId;

  try {
    const newProjects: RemoteProject[] = req.body;
    newProjects.forEach(value => {
      value.projectid = id;
    });
    const conn = await connect();
    await Promise.all([newProjects.map(value => conn.query('INSERT INTO RemoteProjects SET ?', [value]))]);
    res.json(newProjects);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getRomoteProjects(req: Request, res: Response) {
  var id: string = req.params.projectId;
  try {
    const conn = await connect();
    
    const result: RemoteProject[] = (await conn.query<RemoteProject[]>('SELECT * FROM RemoteProjects Where projectId = ?', [id]))[0];
    res.json(result)
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function deleteRemoteProjectById(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var remoteProjectId: number = Number(req.params.remoteProjectId);

  try {
    const conn = await connect();
    const result: RemoteProject = (
      await conn.query<RemoteProject[]>('SELECT * FROM Remoteprojects Where projectId = ? and remoteprojectId = ?', [projectId, remoteProjectId])
    )[0][0];
    if (result !== undefined) {
      await conn.query('DELETE FROM Remoteprojects WHERE projectId = ? and remoteprojectId = ?', [projectId, remoteProjectId]);
      res.json({ message: `RemotePpoject with ID ${remoteProjectId} from project with ID ${projectId} was deleted!` });
    } else {
      res.status(404).json({ message: `No Remoteproject with ID ${remoteProjectId} in project with ID ${projectId}` });
    }
  } catch (err: any) {
    handleError(res, err);
  }
}
