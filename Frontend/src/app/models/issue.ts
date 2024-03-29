import { ALMIssue } from "./alm.models";
import { IssueNode } from "./node";
import { ViewpointLevelLabel } from "./project";

export interface Issue {
  viewpointId: number,
  projectId: string,
  remoteProjectId: number,
  remoteIssueId: number,
  kpiErrors: IssueErrorObject[],
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

export interface IssueLink {
  remoteprojectId: number,
  remoteIssueId: number,
  relatedRemoteProjectId: number,
  relatedRemoteIssueId: number,
}

export interface IssueRelationSettings {
  projectId: string,
  viewpointId: number,
  labelSettings: ViewpointLevelLabel[],
  links: IssueLink[],
}

export interface IssueErrorObject {
  class: ErrorClass,
  type: ErrorType,
  descr: string,
  connectedNode: IssueNode,
}

export enum ErrorType {
  W = 1,
  E = 2,
}

export enum ErrorClass {
  DeadlineError = 1,
  WorkhoursError = 2,
  DeadlineInconsistencyError = 3,
  AccumulatedError = 4,
}
