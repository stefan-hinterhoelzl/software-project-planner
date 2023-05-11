import { ALMIssue } from "./alm.models";

export interface IssueNode {
  issue: ALMIssue;
  children?: IssueNode[];
}
