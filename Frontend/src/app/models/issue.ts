import { ALMIssue } from "./alm.models";
import { IssueNode } from "./node";

export interface Issue {
  viewpointId: number,
  projectId: string,
  remoteProjectId: number,
  remoteIssueId: number,
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


