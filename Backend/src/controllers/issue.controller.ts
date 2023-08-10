import { Request, Response } from 'express';
import { connect } from '../database';
import { ExtendedIssueErrorObject, IssueErrorObject, IssueRelation, RemoteIssues, RemoteIssuesWithErrors } from '../models/remoteIssues';
import { handleError } from './controller.util';
import { PoolConnection, Pool } from 'mysql2/promise';

export async function addRemoteIssuesToProjectViewpoint(req: Request, res: Response) {
  try {
    let newIssues: RemoteIssues[] = req.body;
    //convertJSONtoString(newIssues);
    const conn = await connect();
    await Promise.all([newIssues.map(value => conn.query('INSERT INTO RemoteIssues SET ?', [value]))]);
    res.json(newIssues);
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

export async function getRemoteIssuesbyIDs(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const issues: string[] = req.body;
    if (issues === undefined || issues.length === 0) res.json([]);
    else {
      const conn = await connect();
      const result = (
        await conn.query<RemoteIssues[]>('SELECT * FROM RemoteIssues WHERE projectId = ? AND viewpointId = ? and remoteissueId IN (?) ', [
          projectId,
          viewpointId,
          issues,
        ])
      )[0];

      const extendedResult: RemoteIssuesWithErrors[] = await getKPIErrorsForIssue(result, conn);

      res.json(extendedResult);
    }
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

    const extendedResult: RemoteIssuesWithErrors[] = await getKPIErrorsForIssue(result, conn);

    res.json(extendedResult);
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

export async function issueIsPartofRelationship(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);
  var issueId: number = Number(req.params.issueId);

  try {
    const conn = await connect();

    const result = (
      await conn.query<IssueRelation[]>(
        'SELECT * FROM RemoteIssuesRelation WHERE projectId = ? AND viewpointId = ? AND (parentIssueId = ? OR childIssueId = ?)',
        [projectId, viewpointId, issueId, issueId]
      )
    )[0];

    if (result.length === 0) res.json({ isPart: false });
    else res.json({ isPart: true });
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function updateIssueKPIErrors(
  connection: PoolConnection,
  projectId: string,
  viewpointId: number,
  remoteProjectId: number,
  remoteIssueId: number,
  kpiErrors: IssueErrorObject[]
) {

  const extendedErrors = kpiErrors.map(value => {
    return <ExtendedIssueErrorObject>{
      class: value.class,
      type: value.type,
      descr: value.descr,
      projectId: projectId,
      viewpointId: viewpointId,
      remoteProjectId: remoteProjectId,
      remoteIssueId: remoteIssueId,
      errorIssueRemoteIssueId: value.connectedNode.issue.issueId,
      errorIssueRemoteProjectId: value.connectedNode.issue.projectId
    };
  });

  await Promise.all([extendedErrors.map(value => connection.query('INSERT INTO remoteissueskpierrors SET ?', [value]))]);
}

async function getKPIErrorsForIssue(remoteIssues: RemoteIssues[], conn: Pool): Promise<RemoteIssuesWithErrors[]> {
  const remoteIssuesWithErrors: RemoteIssuesWithErrors[] = [];

  for (let i = 0; i < remoteIssues.length; i++) {
    let issue = remoteIssues[i];
    const result = (
      await conn.query<IssueErrorObject[]>(
        `SELECT class, type, descr  FROM RemoteIssuesKPIErrors WHERE projectId = ? AND viewpointId = ? AND remoteProjectId = ? AND remoteIssueId = ?`,
        [issue.projectId, issue.viewpointId, issue.remoteProjectId, issue.remoteIssueId]
      )
    )[0];

    let newValue = <RemoteIssuesWithErrors>{
      projectId: issue.projectId,
      remoteProjectId: issue.remoteProjectId,
      viewpointId: issue.viewpointId,
      remoteIssueId: issue.remoteIssueId,
      kpiErrors: result,
    };

    remoteIssuesWithErrors.push(newValue);
  }

  return remoteIssuesWithErrors
}

