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


@NgModule({
  declarations: [
    AreYouSureDialogComponent,
    IssueDetailDialogComponent,
    MarkdownPipe,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
  ]
})
export class DialogsModule { }
