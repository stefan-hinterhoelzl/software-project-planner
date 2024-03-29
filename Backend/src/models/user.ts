import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    userId: string;
    email: string;
}