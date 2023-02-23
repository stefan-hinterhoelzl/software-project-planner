import { RowDataPacket } from "mysql2";

export interface RemoteIssues extends RowDataPacket {
    projectViewpointId: number;
    remoteProjectId: number;
    issueRemoteId: number;
}