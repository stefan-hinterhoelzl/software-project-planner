import { Request, Response } from "express";
import { connect } from "../database";
import { Viewpoint } from "../models/projectViewpoint";
import { handleError } from "./controller.util";

export async function createViewpoint(req: Request, res: Response) {
    var projectId: number = Number(req.params.projectId);

    try {
        const conn = await connect()
        const newViewpoint: Viewpoint = req.body
        newViewpoint.lastmodified = new Date(Date.now())
        let result: number  = (await conn.query<any>('SELECT MAX(viewpointid) as max FROM Viewpoints WHERE projectId = ?', [projectId]))[0][0].max
        
        if (result===null) {
            result = 1
        } else result = result+1

        newViewpoint.viewpointId = result
        newViewpoint.projectId = projectId
        await conn.query('INSERT INTO Viewpoints SET ?', [newViewpoint]);
        res.json(newViewpoint)
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function getViewpointsByProject(req: Request, res: Response) {
    var projectId: number = Number(req.params.projectId);
    
    try {
        const conn = await connect()
        const result: Viewpoint[] = (await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ?', [projectId]))[0]
        res.json(result)
    } catch (err: any) {
        handleError(res, err);
      }
}
export async function updateViewpointById(req: Request, res: Response) {
    var projectId: number = Number(req.params.projectId);
    var viewpointId: number = Number(req.params.viewpointId);
    const updateViewpoint = req.body;

    try {
        const conn = await connect()
        const result: Viewpoint = (await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ? AND viewpontId = ?' , [projectId, viewpointId]))[0][0]
        if (result !== undefined) {
            updateViewpoint.lastmodified = new Date(Date.now())
            //reformat for entering again, also use server sided string to prevent manipulation
            await conn.query('UPDATE Viewpoints SET ? WHERE projectId = ? AND viewpointId = ?', [updateViewpoint, projectId, viewpointId]);
            return res.json(updateViewpoint)
        } else {
            res.status(404).json({"message": `Viewpoint does not exist in project with ID ${projectId}`})
        }
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function deleteViewpointById(req: Request, res: Response) {
    var projectId: number = Number(req.params.projectId);
    var viewpointId: number = Number(req.params.viewpointId);

    try {
        const conn = await connect()
        const result: Viewpoint = (await conn.query<Viewpoint[]>('SELECT * FROM Viewpoints Where projectId = ? AND viewpontId = ?' , [projectId, viewpointId]))[0][0]
        if (result !== undefined) {
            await conn.query('DELETE FROM Viewpoints WHERE projectId = ? AND viewpointId = ', [projectId, viewpointId]);
            res.json({"message": `Viewpoint with ID ${viewpointId} in Project with ID ${projectId} was deleted!`})
        } else {
            res.status(404).json({"message": `Viewpoint does not exist in project with ID ${projectId}`})
        }
    } catch (err: any) {
        handleError(res, err);
      }
}

