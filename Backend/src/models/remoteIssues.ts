import { RowDataPacket } from "mysql2";

export interface RemoteIssues extends RowDataPacket {
    projectid: number;
    remoteProjectId: number;
    issueRemoteId: number;
}