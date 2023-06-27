import { RowDataPacket } from "mysql2";

export interface Viewpoint extends RowDataPacket {
    viewpointId: number;
    projectId: string;
    title: string;
    lastModified?: Date;
    lastEvaluated?: Date;

}