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
    remoteProjectId: number,
    accessToken: string,
}
