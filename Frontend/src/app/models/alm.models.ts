export interface ALMProject {
  projectId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  labels: string[];
  webURL: string;
}

export interface ALMIssue {
  projectId: number;
  issueId: number;
  title: number;
  description: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  state: string;
  type: string;
  webURL: string;
  timeStats: ALMTimeStats;
}

export interface ALMTimeStats {
  estimateHours: number;
  spentHours: number;
}


export interface ALMFilteroptions {
  labels: string[];
  state: string;
  updatedBefore: Date;
  updatedAfter: Date;
  titleDescription: string;
}


export interface ALMPaginationoptions {
  page?: number;
  perPage?: number;
}
