import { ALMIssue } from "./alm.models";
import { IssueNode } from "./node";

export interface Issue {
  viewpointId: number,
  projectId: string,
  remoteProjectId: number,
  remoteIssueId: number,
  kpiErrors: IssueErrorObject,
}

export interface IssueJSONCheckObject {
  id: string,
  children: IssueJSONCheckObject[],
}

export interface IssueRelation {
  projectId: string,
  viewpointId: number,
  parentRemoteProjectId: number,
  parentIssueId: number,
  childRemoteProjectId: number,
  childIssueId: number,
  nodeOrder: number,
}

export interface IssueRelationObjects {
  parent: IssueNode,
  child: IssueNode,
}

export interface IssueErrorObject {
  deadline_error: boolean,
  deadline_error_descr: string,
  booked_hours: boolean,
  booked_hours_descr: string,
}


