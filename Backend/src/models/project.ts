import { RowDataPacket } from "mysql2";

export interface Project extends RowDataPacket {
    projectId: string;
    title: string;
    description: string;
    owner: string;
    favourite: boolean;
    createdAt: Date;
    lastmodified: Date;
}