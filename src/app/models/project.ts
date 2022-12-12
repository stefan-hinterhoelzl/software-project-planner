import { Timestamp } from "@firebase/firestore";

export interface Project {
    name: string,
    description: string,
    owner: string,
    createdAt: Timestamp,
    lastModified: Timestamp,
    gitLabInstances: string[],

}
