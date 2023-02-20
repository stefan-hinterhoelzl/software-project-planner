import { Request, Response } from "express";
import { connect } from "../database";
import { RemoteProject } from "../models/remoteProjects";



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

async function handleError(res: Response, err: any) {
    res.status(500).json({"Error Number": err.errno, "Error Code": err.code, "SQL Error Message": err.sqlMessage})
}