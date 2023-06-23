import { ALMIssue } from './alm.models';
import { IssueErrorObject } from './issue';

export interface IssueNode {
  issue: ALMIssue;
  id: string;
  kpiErrors: IssueErrorObject;
  children: IssueNode[];
  parent?: IssueNode;
  isExpanded?: boolean;
  nodeOrder?: number;
}

export interface DropInfo {
  targetId: string;
  action?: string;
}
