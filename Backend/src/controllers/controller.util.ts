import { Response } from 'express';

export async function handleError(res: Response, err: any) {
  res.status(500).json({ 'Error Number': err.errno, 'Error Code': err.code, 'SQL Error Message': err.sqlMessage });
}
