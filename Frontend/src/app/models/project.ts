import { Timestamp } from "@firebase/firestore";

export interface Project {
    projectId: string,
    title: string,
    description: string,
    owner: string,
    createdAt: Date,
    lastModified: Date,
    favourite: boolean,

}

export interface RemoteProject {
    projectId?: string,
    remoteProjectId: number,
    accessToken: string,
}

export interface Viewpoint {
    viewpointId?: number,
    projectId?: string,
    title: string,
    lastModified: Date,
}

export interface ProjectWrapper {
    project: Project,
    viewPoints: Viewpoint[],
}
