import { createPool } from 'mysql2/promise';

export async function connect() {

    const connection = await createPool({
        host: process.env.DATABASE_URL,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 10
    });

    return connection;

}