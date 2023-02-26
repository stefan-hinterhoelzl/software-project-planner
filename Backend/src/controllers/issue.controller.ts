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
      issues.map(value =>
        conn.query('DELETE FROM RemoteIssues WHERE projectViewpointId = ? AND remoteProjectId = ? AND remoteIssueId = ?', [
          value.projectViewpointId,
          value.remoteProjectId,
          value.issueRemoteId,
        ])
      ),
    ]);
  } catch (err: any) {
    handleError(res, err);
  }
}

//single routes?
