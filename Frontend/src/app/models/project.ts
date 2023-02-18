import { Timestamp } from "@firebase/firestore";

export interface Project {
    title: string,
    description: string,
    owner: string,
    createdAt: Timestamp,
    lastModified: Timestamp,
    ALMInstances: RemoteProject[],
    selectedIssues: string[]
    favourite: boolean,
    uid: string,
}


export interface RemoteProject {
    remoteID: number,
    accessToken: string,
}
