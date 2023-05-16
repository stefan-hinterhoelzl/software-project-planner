import { Request, Response } from 'express';
import { connect } from '../database';
import { IssueRelation, RemoteIssues } from '../models/remoteIssues';
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
      result = (await conn.query<RemoteIssues[]>('SELECT * FROM RemoteIssues Where projectId = ? AND viewpointId = ?', [projectId, viewpointId]))[0];
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

export async function getSelectedIssuesFromViewpointWithoutRelation(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();

    const result = (
      await conn.query<RemoteIssues[]>(
        `SELECT ri.projectId, ri.viewpointId, ri.remoteIssueId, ri.remoteProjectId
      FROM remoteissues ri LEFT JOIN remoteissuesrelation rir 
      ON ri.viewpointId = rir.viewpointId AND ri.projectId = rir.projectId
      AND ((ri.remoteIssueId = rir.parentIssueId AND ri.remoteProjectId = rir.parentRemoteProjectId) 
           OR (ri.remoteIssueId = rir.childIssueId AND ri.remoteProjectId = rir.childRemoteProjectId))
      WHERE rir.projectId IS NULL AND ri.viewpointId = ? AND ri.projectId = ?`,
        [viewpointId, projectId]
      )
    )[0];

    res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getSelectedIssueRelations(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();

    const result = (
      await conn.query<IssueRelation[]>(`SELECT * FROM RemoteIssuesRelation WHERE projectId = ? AND viewpointId = ?`, [projectId, viewpointId])
    )[0];

    res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function postSelectedIssueRelations(req: Request, res: Response) {
  try {
    const newProjects: RemoteIssues[] = req.body;
    const conn = await connect();
    await Promise.all([newProjects.map(value => conn.query('INSERT INTO RemoteIssuesRelation SET ?', [value]))]);
    res.json(newProjects);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function deleteSelectedIssueRelations(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();

    await conn.query(`DELETE FROM RemoteIssuesRelation WHERE projectId = ? AND viewpointId = ?`, [projectId, viewpointId]);

    res.json({ response: 'success' });
  } catch (err: any) {
    handleError(res, err);
  }
}
