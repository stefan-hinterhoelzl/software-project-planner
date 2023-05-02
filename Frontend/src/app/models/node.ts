import { ALMIssue } from "./alm.models";

interface IssueNode {
  issue: ALMIssue;
  children?: IssueNode[];
}
