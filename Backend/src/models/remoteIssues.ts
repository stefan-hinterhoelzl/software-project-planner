import { RowDataPacket } from "mysql2";

export interface RemoteIssuesWithErrors extends RowDataPacket {
    viewpointId: number;
    remoteProjectId: number;
    remoteIssueId: number;
    projectId: string;
    kpiErrors: IssueErrorObject[];
}

export interface RemoteIssues extends RowDataPacket {
  viewpointId: number;
  remoteProjectId: number;
  remoteIssueId: number;
  projectId: string;
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

  export interface IssueErrorObject extends RowDataPacket {
    class: ErrorClass,
    type: ErrorType,
    descr: string,
  }
  
  export enum ErrorType {
    W = 1,
    E = 2,
  }
  
  export enum ErrorClass {
    DeadlineError = 1,
    WorkhoursError = 2,
  }