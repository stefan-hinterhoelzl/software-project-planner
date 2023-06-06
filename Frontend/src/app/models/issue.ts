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
  deadlineError: boolean,
  deadlineErrorDescr: string,
  bookedHoursError: boolean,
  bookedHoursErrorDescr: string,
}

export function createEmptyErrorObject(): IssueErrorObject {
  return <IssueErrorObject> {
    deadlineError: false,
    deadlineErrorDescr: '',
    bookedHoursError: false,
    bookedHoursErrorDescr: '',
  }
}

