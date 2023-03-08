export interface ALMProject {
  projectId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  webURL: string;
}

export interface ALMIssue {
  projectId: number;
  issueId: number;
  title: string;
  description: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
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

export interface ALMIssueResWrapper {
  issues: ALMIssue[],
  totalitems: number,
  totalpages: number,
}


export interface ALMFilteroptions {
  labels: string[];
  state: string;
  updatedBefore: string;
  updatedAfter: string;
  titleDescription: string;
}


export interface ALMPaginationoptions {
  page?: number;
  perPage?: number;
}
