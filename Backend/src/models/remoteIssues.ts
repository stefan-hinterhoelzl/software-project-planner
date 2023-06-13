import { RowDataPacket } from "mysql2";

export interface RemoteIssues extends RowDataPacket {
    viewpointId: number;
    remoteProjectId: number;
    remoteIssueId: number;
    projectId: string;
    kpiErrors: string;
}

export interface IssueRelation extends RowDataPacket {
    projectId: string,
    viewpointId: number,
    parentRemoteProjectId: number,
    parentIssueId: number,
    childRemoteProjectId: number,
    childIssueId: number,
    nodeOrder: number,
  }