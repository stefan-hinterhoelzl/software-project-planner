import { Timestamp } from "@firebase/firestore";

export interface Project {
    name: string,
    description: string,
    owner: string,
    createdAt: Timestamp,
    lastModified: Timestamp,
    ALMInstances: RemoteProject[],
    selectedIssues: number[]
    favourite: boolean,
    uid: string,
}


export interface RemoteProject {
    remoteID: string,
    accessToken: string,
}
