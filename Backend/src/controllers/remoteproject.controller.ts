import { Request, Response } from "express";
import { connect } from "../database";
import { RemoteProject } from "../models/remoteProjects";
import { handleError } from "./controller.util";



export async function addRemoteProjects(req: Request, res: Response) {

    try {
        const newProjects: RemoteProject[] = req.body;
        const conn = await connect()
        await Promise.all([newProjects.map(value => conn.query('INSERT INTO RemoteProjects SET ?', [value]))]);
        res.json(newProjects)

        
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function getRomoteProjects(req: Request, res: Response) {
    var id: number = Number(req.params.id)
    try {
        const conn = await connect()
        const result: RemoteProject[] = (await conn.query<RemoteProject[]>('SELECT * FROM RemoteProjects Where projectId = ?', [id]))[0]
        return result
    } catch (err: any) {
        handleError(res, err);
      }
}


