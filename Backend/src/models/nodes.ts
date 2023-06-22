export interface IssueNode {
    issue: ALMIssue;
    id: string;
    kpiErrors: IssueErrorObject;
    children: IssueNode[];
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