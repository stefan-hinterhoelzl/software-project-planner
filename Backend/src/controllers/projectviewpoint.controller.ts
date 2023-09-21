import { Request, Response } from 'express';
import { connect } from '../database';
import { ExtendedViewpointLevelLabel, Viewpoint, ViewpointLevelLabel } from '../models/projectViewpoint';
import { handleError } from './controller.util';
import { PoolConnection, Pool } from 'mysql2/promise';
import { level } from 'winston';

export async function createViewpoint(req: Request, res: Response) {
  var projectId: string = req.params.projectId;

  try {
    const conn = await connect();
    const newViewpoint: Viewpoint = req.body;
    newViewpoint.lastModified = new Date(Date.now());
    let result: number = (await conn.query<any>('SELECT MAX(viewpointid) as max FROM Viewpoints WHERE projectId = ?', [projectId]))[0][0].max;

    if (result === null) {
      result = 1;
    } else result = result + 1;

    newViewpoint.viewpointId = result;
    newViewpoint.projectId = projectId;
    await conn.query('INSERT INTO Viewpoints SET ?', [newViewpoint]);
    res.json(newViewpoint);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getViewpointsByProject(req: Request, res: Response) {
  var projectId: string = req.params.projectId;

  try {
    const conn = await connect();
    const result: Viewpoint[] = (await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ?', [projectId]))[0];
    res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}
export async function updateViewpointById(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);
  const updateViewpoint = req.body;

  try {
    const conn = await connect();
    const result: Viewpoint = (
      await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ? AND viewpointId = ?', [projectId, viewpointId])
    )[0][0];
    if (result !== undefined) {
      updateViewpoint.lastmodified = new Date(Date.now());
      //reformat for entering again, also use server sided string to prevent manipulation
      await conn.query('UPDATE Viewpoints SET ? WHERE projectId = ? AND viewpointId = ?', [updateViewpoint, projectId, viewpointId]);
      return res.json(updateViewpoint);
    } else {
      res.status(404).json({ message: `Viewpoint does not exist in project with ID ${projectId}` });
    }
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function deleteViewpointById(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();
    const result: Viewpoint = (
      await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ? AND viewpointId = ?', [projectId, viewpointId])
    )[0][0];
    if (result !== undefined) {
      await conn.query('DELETE FROM Viewpoints WHERE projectId = ? AND viewpointId = ?', [projectId, viewpointId]);
      res.json({ message: `Viewpoint with ID ${viewpointId} in Project with ID ${projectId} was deleted!` });
    } else {
      res.status(404).json({ message: `Viewpoint does not exist in project with ID ${projectId}` });
    }
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getViewpointById(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();
    const result: Viewpoint = (
      await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ? AND viewpointId = ?', [projectId, viewpointId])
    )[0][0];
    if (result === undefined) {
      res.status(404).json({ message: `Viewpoint with ID ${viewpointId} does not exist in project with ID ${projectId}` });
    } else return res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getViewpointHierarchySettings(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();
    const result: ViewpointLevelLabel[] = (
      await conn.query<ViewpointLevelLabel[]>('SELECT level, label FROM ViewpointHierarchieSettings WHERE projectId = ? AND viewpointId = ?', [
        projectId,
        viewpointId,
      ])
    )[0];
    return res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function updateViewpointHierarchySettings(req: Request, res: Response) {
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);
  let levelLabel: ViewpointLevelLabel[] = req.body;

  try {
    const conn = await connect();

    await Promise.all([levelLabel.map(value => insertOrUpdateHierarchySetting(projectId, viewpointId, value, conn))]);

    return res.status(200);
  } catch (err: any) {
    handleError(res, err);
  }
}

async function insertOrUpdateHierarchySetting(projectId: string, viewpointId: number, levelLabel: ViewpointLevelLabel, conn: Pool): Promise<void> {
  let setting = <ExtendedViewpointLevelLabel>{
    viewpointId: viewpointId,
    projectId: projectId,
    level: levelLabel.level,
    label: levelLabel.label,
  };

  const result: ViewpointLevelLabel = (
    await conn.query<ViewpointLevelLabel[]>(
      'SELECT level, label FROM ViewpointHierarchieSettings WHERE projectId = ? AND viewpointId = ? AND level = ?',
      [projectId, viewpointId, levelLabel.level]
    )
  )[0][0];

  if (result !== undefined && result.label !== setting.label) {
    await conn.query('UPDATE ViewpointHierarchieSettings SET label = ? WHERE projectId = ? AND viewpointId = ? AND level = ?', [
      projectId,
      viewpointId,
      levelLabel.level,
    ]);
  } else {
    await conn.query('INSERT INTO ViewpointHierarchieSettings SET ?', [setting]);
  }

  return;
}

export const updateViewpointLastEdited = async (connection: PoolConnection, projectId: string, viewpointId: number) => {
  let lastModified: Date;
  let lastEvaluated: Date;
  lastModified = lastEvaluated = new Date(Date.now());
  await connection.query('UPDATE Viewpoints SET lastModified = ?, lastEvaluated = ? WHERE projectId = ? AND viewpointId = ?', [
    lastModified,
    lastEvaluated,
    projectId,
    viewpointId,
  ]);
};
