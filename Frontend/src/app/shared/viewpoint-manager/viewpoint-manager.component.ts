import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, Viewpoint } from 'src/app/models/project';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DataService } from 'src/app/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-viewpoint-manager',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './viewpoint-manager.component.html',
  styleUrls: ['./viewpoint-manager.component.scss']
})
export class ViewpointManagerComponent {

  @Input() viewpoints: Viewpoint[] = [];
  @Input() project: Project | undefined;

  dialog = inject(MatDialog)
  data = inject(DataService)

  viewpoint$ = this.data.activeViewpoint$



  createViewpoint(projectId: string, viewpoints: Viewpoint[]) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(NewViewpointDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: string) => {
      if (data !== undefined) {
        const newViewpoint = <Viewpoint>{
          title: data,
        };

        this.data.addViewpoint(projectId, newViewpoint, viewpoints);
      }
    });
  }

  chooseViewpoint(viewpoint: Viewpoint) {
    if (viewpoint.viewpointId !== undefined) this.data.setActiveViewpoint(viewpoint.viewpointId);
  }
}
