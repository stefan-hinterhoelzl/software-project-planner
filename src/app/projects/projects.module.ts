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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { ProjectListViewComponent } from './project-view/project-list-view/project-list-view.component';
import { ProjectTreeViewComponent } from './project-view/project-tree-view/project-tree-view.component';
import { ProjectConfigViewComponent } from './project-view/project-config-view/project-config-view.component';



@NgModule({
  declarations: [
    ProjectSearchComponent,
    CreateProjectComponent,
    ProjectViewComponent,
    ProjectListViewComponent,
    ProjectTreeViewComponent,
    ProjectConfigViewComponent
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
    MatToolbarModule,
    MatCardModule,


  ],
  exports: [
    ProjectSearchComponent
  ],
  providers: [SnackbarComponent],
})
export class ProjectsModule { }
