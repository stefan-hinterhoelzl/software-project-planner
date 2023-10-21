import { RowDataPacket } from "mysql2";
import { IssueNode } from "./nodes";

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
    connectedNode: IssueNode,
  }

  export interface ExtendedIssueErrorObject extends RowDataPacket {
    class: ErrorClass,
    type: ErrorType,
    descr: string,
    projectId: string,
    viewpointId: number,
    remoteProjectId: number,
    remoteIssueId: number,
    errorIssueRemoteProjectId: number,
    errorIssueRemoteIssueId: number,
  }

  export interface IssueRelationSettings {
    projectId: string,
    viewpointId: number,
    labelSettings: ViewpointLevelLabel[],
    links: IssueLink[],
  }

  export interface ViewpointHierarchieSettings {
    projectId: string;
    viewpointId: number;
    labels: ViewpointLevelLabel[];
  }
  
  export interface ViewpointLevelLabel {
    label: string;
    level: number;
  }

  export interface IssueLink {
    remoteprojectId: number,
    remoteIssueId: number,
    relatedRemoteProjectId: number,
    relatedRemoteIssueId: number,
  }
  
  export enum ErrorType {
    W = 1,
    E = 2,
  }
  
  export enum ErrorClass {
    DeadlineError = 1,
    WorkhoursError = 2,
    DeadlineInconsistencyError = 3,
  }