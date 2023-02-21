import { Request, Response } from 'express';
import { connect } from '../database'
import { Project } from '../models/project';
import { handleError } from './controller.util';

export async function createProject(req: Request, res: Response) {

    try {
        const newProject: Project = req.body;
        newProject.createdAt = new Date(Date.now())
        newProject.lastmodified = new Date(Date.now())

        const conn = await connect()
        await conn.query('INSERT INTO projects SET ?', [newProject]);
        res.json(newProject)
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function getProjectById(req: Request, res: Response) {
    var id: number = Number(req.params.id);

    try {
        const conn = await connect()
        const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0]
        if (result === undefined) res.status(404).json({"message": `No Project with ID ${id}`})
        else res.json(result)
    } catch (err: any) {
        handleError(res, err);
      }

}

export async function getProjectsByOwner(req: Request, res: Response) {
    var owner: string = req.params.owner;
    
    try {
        const conn = await connect()
        const result: Project[] = (await conn.query<Project[]>('SELECT * FROM Projects Where owner = ?', [owner]))[0]
        res.json(result)
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function updateProjectById(req: Request, res: Response) {
    var id: number = Number(req.params.id);
    const updateProject = req.body;

    try {
        const conn = await connect()
        const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0]
        if (result !== undefined) {
            updateProject.lastmodified = new Date(Date.now())
            //reformat for entering again, also use server sided string to prevent manipulation
            updateProject.createdAt = new Date(result.createdAt)
            await conn.query('UPDATE Projects SET ? WHERE projectId = ?', [updateProject, id]);
            return res.json(updateProject)
        } else {
            res.status(404).json({"message": `No Project with ID ${id}`})
        }
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function deleteProjectById(req: Request, res: Response) {
    var id: number = Number(req.params.id);

    try {
        const conn = await connect()
        const result: Project = (await conn.query<Project[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0]
        if (result !== undefined) {
            await conn.query('DELETE FROM Projects WHERE projectId = ?', [id]);
            res.json({"message": `Project with ID ${id} was deleted!`})
        } else {
            res.status(404).json({"message": `No Project with ID ${id}`})
        }
    } catch (err: any) {
        handleError(res, err);
      }
}


