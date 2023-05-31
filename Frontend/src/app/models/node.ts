import { ALMIssue } from './alm.models';

export interface IssueNode {
  issue: ALMIssue;
  id: string;
  children: IssueNode[];
  isExpanded?: boolean;
  nodeOrder?: number;
}

export interface DropInfo {
  targetId: string;
  action?: string;
}
