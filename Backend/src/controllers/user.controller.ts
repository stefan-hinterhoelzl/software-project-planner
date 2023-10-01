import { Request, Response } from 'express';
import { connect } from '../database';
import { User } from '../models/user';
import { handleError } from './controller.util';

export async function createUser(req: Request, res: Response) {
  const newUser: User = req.body;

  try {
    const conn = await connect();
    const result: User = (await conn.query<User[]>('SELECT * FROM Users Where userId = ?', [newUser.userId]))[0][0];
    if (result === undefined) {
      await insertUser(newUser);
      res.json(newUser);
    } else res.json(result);
  } catch (err: any) {
    handleError(res, err);
  }
}

async function insertUser(newUser: User): Promise<void> {
  const conn = await connect();
  await conn.query('INSERT INTO users SET ?', [newUser]);
  return;
}
