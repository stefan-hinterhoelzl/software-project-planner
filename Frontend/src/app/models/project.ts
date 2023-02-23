import { Timestamp } from "@firebase/firestore";

export interface Project {
    projectId: number,
    title: string,
    description: string,
    owner: string,
    createdAt: Date,
    lastModified: Date,
    favourite: boolean,

}


export interface RemoteProject {
    remoteID: number,
    accessToken: string,
}
