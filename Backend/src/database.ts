import { createPool, Pool, PoolConnection } from 'mysql2/promise';

let connection: Pool | undefined = undefined;

export async function connect(): Promise<Pool> {

    // If the pool was already created, return it instead of creating a new one.
  if(typeof connection !== 'undefined') {
    return connection;
  }

    connection = createPool({
        host: process.env.DATABASE_URL,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 100
    });

    return connection;

}


export async function getConnection(): Promise<PoolConnection> {
  return (await connect()).getConnection();
}