import { RowDataPacket } from 'mysql2';

export interface Viewpoint extends RowDataPacket {
  viewpointId: number;
  projectId: string;
  title: string;
  lastModified?: Date;
  lastEvaluated?: Date;
}

export interface ViewpointLevelLabel extends RowDataPacket {
  label: string;
  level: number;
}

export interface ExtendedViewpointLevelLabel extends RowDataPacket {
  projectId: string;
  viewpointId: number;
  label: string;
  level: number;
}
