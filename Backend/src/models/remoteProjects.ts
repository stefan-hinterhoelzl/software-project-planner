import { RowDataPacket } from "mysql2";

export interface RemoteProject extends RowDataPacket {
    projectid: number;
    remoteProjectId: number;
    accessToken: string;
}