import { Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { combineLatest, share, tap } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { Viewpoint } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-tree-view',
  templateUrl: './project-tree-view.component.html',
  styleUrls: ['./project-tree-view.component.scss']
})
export class ProjectTreeViewComponent implements OnInit {

  data = inject(DataService)
  dialog = inject(MatDialog);


  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe();
  project$ = this.data.activeProject$.pipe();
  view$ = combineLatest([this.project$, this.viewpoints$]).pipe(share());

  ngOnInit(): void {

  }




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
    //this.router.navigate(['viewpoint', viewpoint.viewpointId], {relativeTo: this.route})
  }




}
