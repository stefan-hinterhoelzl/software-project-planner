import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectSearchComponent } from './project-search/project-search.component';
import { MatListModule } from '@angular/material/list';
import { CreateProjectComponent } from './create-project/create-project.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input'
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { AppRoutingModule } from '../app-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ProjectViewComponent } from './project-view/project-view/project-view.component';



@NgModule({
  declarations: [
    ProjectSearchComponent,
    CreateProjectComponent,
    ProjectViewComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatListModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    AppRoutingModule,
    MatDialogModule,
  ],
  exports: [
    ProjectSearchComponent
  ],
  providers: [SnackbarComponent],
})
export class ProjectsModule { }
