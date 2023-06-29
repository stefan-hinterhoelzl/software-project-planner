import { RowDataPacket } from "mysql2";

export interface RemoteProject extends RowDataPacket {
    projectid: string;
    remoteProjectId: number;
    accessToken: string;
    dateAdded: Date;
}