import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { combineLatest, share, tap } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { Viewpoint } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-item-options',
  templateUrl: './project-item-options.component.html',
  styleUrls: ['./project-item-options.component.scss'],
})
export class ProjectItemOptionsComponent {
  data = inject(DataService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  viewpointDetails = this.fb.group({
    nameCtrl: ['', Validators.required],
  });

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(
    tap(viewpoint => {
      if (viewpoint !== undefined) this.viewpointDetails.get('nameCtrl')?.setValue(viewpoint?.title);
    })
  );
  project$ = this.data.activeProject$;
  view$ = combineLatest([this.project$, this.viewpoints$]).pipe(share());

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


   updateViewpoint(projectId: string, viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    viewpoint.title = this.viewpointDetails.get('nameCtrl')?.value as string
    this.data.updateViewpoint(projectId, viewpoint, viewpoints);
   }


}
