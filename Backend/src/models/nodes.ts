export interface IssueNode {
    issue: ALMIssue;
    id: string;
    kpiErrors: IssueErrorObject[];
    children: IssueNode[];
    parent?: IssueNode;
    isExpanded?: boolean;
    nodeOrder?: number;
}

export interface ALMIssue {
    projectId: number;
    issueId: number;
    title: string;
    description: string;
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    dueDate: Date;
    state: string;
    type: string;
    webURL: string;
    timeStats: ALMTimeStats;
    selected: boolean;
}

export interface ALMTimeStats {
    estimateHours: number;
    spentHours: number;
}

export interface IssueErrorObject {
    class: ErrorClass,
    type: ErrorType,
    descr: string,
  }
  
  export enum ErrorType {
    W = 1,
    E = 2,
  }
  
  export enum ErrorClass {
    DeadlineError = 1,
    WorkhoursError = 2,
  }