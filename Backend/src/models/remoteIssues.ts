import { RowDataPacket } from "mysql2";

export interface RemoteIssues extends RowDataPacket {
    viewpointId: number;
    remoteProjectId: number;
    remoteIssueId: number;
    projectId: string
}