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
  deadlineError: ErrorType,
  deadlineErrorDescr: string,
  bookedHoursError: ErrorType,
  bookedHoursErrorDescr: string,
}

export enum ErrorType {
  W, 
  E,
  N,
}

export function createEmptyErrorObject(): IssueErrorObject {
  return <IssueErrorObject> {
    deadlineError: ErrorType.N,
    deadlineErrorDescr: '',
    bookedHoursError: ErrorType.N,
    bookedHoursErrorDescr: '',
  }
}

