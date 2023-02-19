import { Request, Response } from 'express';
import { connect } from '../database'
import { Project } from '../models/project';

export async function createProject(req: Request, res: Response) {
    const newProject: Project = req.body;
    newProject.createdAt = new Date(Date.now())
    newProject.lastmodified = new Date(Date.now())

    const conn = await connect();
    await conn.query('INSERT INTO projects SET ?', [newProject]);
    res.json(newProject)
}