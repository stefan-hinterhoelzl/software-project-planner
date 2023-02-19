export interface Project {
    projectid?: number;
    title: string;
    description: string;
    owner: string;
    favourite: boolean;
    createdAt: Date;
    lastmodified: Date;
}