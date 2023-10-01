import { Request, Response } from 'express';
import { connect } from '../database';
import { Project } from '../models/project';
import { handleError } from './controller.util';
import { v4 as uuidv4 } from 'uuid';

export async function createProject(req: Request, res: Response) {
  try {
    const newProject: Project = req.body;
    newProject.createdAt = new Date(Date.now());
    newProject.lastModified = new Date(Date.now());
    newProject.projectId = uuidv4();

    const conn = await connect();
    conn.query('INSERT INTO Projects SET ?', [newProject]);
    res.json(newProject);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getProjectById(req: Request, res: Response) {
  var id: string = req.params.projectId;

  try {
    const conn = await connect();
    const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0];
    if (result === undefined) res.status(404).json({ message: `No Project with ID ${id}` });
    else res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function getProjectsByOwner(req: Request, res: Response) {
  var owner: string = req.params.owner;

  try {
    const conn = await connect();
    const result: Project[] = (await conn.query<Project[]>('SELECT * FROM Projects Where owner = ?', [owner]))[0];
    res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function updateProjectById(req: Request, res: Response) {
  var id: string = req.params.projectId;
  const updateProject = req.body;

  try {
    const conn = await connect();
    const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0];
    if (result !== undefined) {
      
      updateProject.lastModified = new Date(Date.now());
      //reformat for entering again, also use server sided string to prevent manipulation
    
      
      await conn.query('UPDATE Projects SET ? WHERE projectId = ?', [updateProject, id]);
      return res.json(updateProject);
    } else {
      res.status(404).json({ message: `No Project with ID ${id}` });
    }
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function deleteProjectById(req: Request, res: Response) {
  var id: string = req.params.projectId;

  try {
    const conn = await connect();
    const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0];
    if (result !== undefined) {
      await conn.query('DELETE FROM Projects WHERE projectId = ?', [id]);
      res.json({ message: `Project with ID ${id} was deleted!` });
    } else {
      res.status(404).json({ message: `No Project with ID ${id}` });
    }
  } catch (err: any) {
    handleError(res, err);
  }
}

export async function checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
  try {
    const conn = await connect();
    const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ? AND owner = ?', [projectId, userId]))[0][0];
    return result === undefined;
  } catch (err: any) {
    return false;
  }
}
