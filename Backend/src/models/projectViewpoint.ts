import { RowDataPacket } from "mysql2";

export interface Viewpoint extends RowDataPacket {
    viewpointId: number;
    projectId: number;
    title: string;
    lastModified: Date; 

}