import { Request, Response } from 'express';
import { connect } from '../database'
import { User } from '../models/user';
import { handleError } from './controller.util';

export async function createUser(req: Request, res: Response) {

    try {
        const newUser: User = req.body;
        const conn = await connect()
        await conn.query('INSERT INTO users SET ?', [newUser]);
        res.json(newUser)
    } catch (err: any) {
        handleError(res, err);
      }
}

export async function getUserById(req: Request, res: Response) {

    var id: string = req.params.id;

    try {
        const conn = await connect()
        const result: User = (await conn.query<User[]>('SELECT * FROM Projects Where projectId = ?', [id]))[0][0]
        if (result === undefined) res.status(404).json({"message": `No Project with ID ${id}`})
        else res.json(result)
    } catch (err: any) {
        handleError(res, err);
      }
}



