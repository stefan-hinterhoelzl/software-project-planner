import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, combineLatest, of, share, shareReplay, switchMap, tap } from 'rxjs';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { Viewpoint } from 'src/app/models/project';
import { CanComponentDeactivate } from 'src/app/services/can-deactivate-guard.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-item-options',
  templateUrl: './project-item-options.component.html',
  styleUrls: ['./project-item-options.component.scss'],
})
export class ProjectItemOptionsComponent implements CanComponentDeactivate {
  data = inject(DataService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  viewpointDetails = this.fb.group({
    nameCtrl: ['', Validators.required],
  });

  local_viewpoint!: Viewpoint;

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(
    tap(viewpoint => {
      if (viewpoint !== undefined) {
        this.viewpointDetails.get('nameCtrl')?.setValue(viewpoint?.title);
        this.local_viewpoint = viewpoint
      }
    })
  );
  project$ = this.data.activeProject$;
  view$ = combineLatest([this.project$, this.viewpoints$]).pipe(shareReplay(1));

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.view$.pipe(
      switchMap(value => {
        if (this.viewpointDetails.dirty) {

          const dialogConfigKeep = new MatDialogConfig();

          dialogConfigKeep.data = {
            title: 'Unsaved Changes!',
            content: 'You have unsaved changes. They are lost when you leave the page!',
            button1: 'Discard Changes',
            button2: 'Save Changes',
          };

          dialogConfigKeep.disableClose = true;

          const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
          return dialogRef.afterClosed().pipe(switchMap(result => {

            if (!result) {
              this.updateViewpoint(value[0]!.projectId, this.local_viewpoint, value[1]);
            }
            return of(true)
          })
          );
        }
        else return of(true)
      })

    )
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
  }

  updateViewpoint(projectId: string, viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    viewpoint.title = this.viewpointDetails.get('nameCtrl')?.value as string;
    this.data.updateViewpoint(projectId, viewpoint, viewpoints);
    this.viewpointDetails.markAsPristine()
  }

  deleteViewpoint(viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    const dialogConfigKeep = new MatDialogConfig();

    dialogConfigKeep.data = {
      title: 'Are you sure?',
      content: 'The viewpoint can not be restored after it was deleted. All items selected for this viewpoint are deleted too.',
      button1: 'Delete',
      button2: 'Cancel',
    };

    dialogConfigKeep.disableClose = true;

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.deleteViewpoint(viewpoint, viewpoints)
      }
    })
  }
}
