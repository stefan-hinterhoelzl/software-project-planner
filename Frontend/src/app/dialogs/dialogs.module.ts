import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreYouSureDialogComponent } from './are-you-sure-dialog/are-you-sure-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { IssueDetailDialogComponent } from './issue-detail-dialog/issue-detail-dialog.component';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import {MatChipsModule} from '@angular/material/chips';
import { NewViewpointDialogComponent } from './new-viewpoint-dialog/new-viewpoint-dialog.component';
import { NodeBacklogDetailDialogComponent } from './node-backlog-detail-dialog/node-backlog-detail-dialog.component';
import { NodeTreeDetailDialogComponent } from './node-tree-detail-dialog/node-tree-detail-dialog.component';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    AreYouSureDialogComponent,
    IssueDetailDialogComponent,
    MarkdownPipe,
    NodeBacklogDetailDialogComponent,
    NodeTreeDetailDialogComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDividerModule,
  ]
})
export class DialogsModule { }
