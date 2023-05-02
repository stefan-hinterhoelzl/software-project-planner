import { Request, Response } from 'express';
import { connect } from '../database';
import { RemoteIssues } from '../models/remoteIssues';
import { handleError } from './controller.util';

export async function addRemoteIssuesToProjectViewpoint(req: Request, res: Response) {
  try {
    const newProjects: RemoteIssues[] = req.body;
    const conn = await connect();
    await Promise.all([newProjects.map(value => conn.query('INSERT INTO RemoteIssues SET ?', [value]))]);
    res.json(newProjects);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function removeRemoteIssuesFromProjectViewpoint(req: Request, res: Response) {
  try {
    const issues: RemoteIssues[] = req.body;
    const conn = await connect();
    await Promise.all([
      issues.forEach(value => {
        conn.query('DELETE FROM RemoteIssues WHERE viewpointId = ? AND remoteProjectId = ? AND remoteIssueId = ? AND projectId = ?', [
          value.viewpointId,
          value.remoteProjectId,
          value.remoteIssueId,
          value.projectId,
        ]);
      }),
      res.json(issues),
    ]);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getRemoteIssuesFromProjectViewpoint(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);
  var remoteProjectId: number = Number(req.query.remoteProjectId);

  try {
    const conn = await connect();
    let result: RemoteIssues[];
    if (remoteProjectId !== -1) {
    result = (
      await conn.query<RemoteIssues[]>('SELECT * FROM RemoteIssues Where projectId = ? AND viewpointId = ? AND remoteProjectId = ?', [
        projectId,
        viewpointId,
        remoteProjectId,
      ])
    )[0];
    } else {
      result = (
        await conn.query<RemoteIssues[]>('SELECT * FROM RemoteIssues Where projectId = ? AND viewpointId = ?', [
          projectId,
          viewpointId,
        ])
      )[0];
    }

    if (result === undefined) {
      res.status(404).json({ message: `Viewpoint with ID ${viewpointId} does not exist in project with ID ${projectId}` });
    } else return res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function removeAllIssuesByRemoteProject(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var remoteProjectId: number = Number(req.params.remoteProjectId);

  try {
    const conn = await connect();

    conn.query('DELETE FROM RemoteIssues WHERE projectId = ? AND remoteProjectId = ?', [projectId, remoteProjectId]);

    res.json({ 'response:': 'success' });
  } catch (err: any) {
    handleError(res, err);
  }
}
