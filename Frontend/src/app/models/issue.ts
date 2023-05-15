export interface Issue {
  viewpointId: number,
  projectId: string,
  remoteProjectId: number,
  remoteIssueId: number,
}

export interface IssueRelation {
  projectId: string,
  viewpointId: number,
  parentRemoteProjectId: number,
  parentIssueId: number,
  childRemoteProjectId: number,
  childIssueId: number,
}

export interface IssueRelationObjects {
  parent: Issue,
  child: Issue,
}


