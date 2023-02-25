import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { CreateProjectComponent } from './create-project/create-project.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input'
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { ProjectViewComponent } from './project-view/project-view/project-view.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { ProjectListViewComponent } from './project-view/project-item-view/project-list-view/project-list-view.component';
import { ProjectTreeViewComponent } from './project-view/project-item-view/project-tree-view/project-tree-view.component';
import { ProjectConfigViewComponent } from './project-view/project-config-view/project-config-view.component';
import { ProjectRoutingModule } from './project-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ProjectDashboardComponent } from './project-view/project-dashboard/project-dashboard.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectItemViewComponent } from './project-view/project-item-view/project-item-view.component';
import { MatSidenavModule } from '@angular/material/sidenav';





@NgModule({
  declarations: [
    CreateProjectComponent,
    ProjectViewComponent,
    ProjectListViewComponent,
    ProjectTreeViewComponent,
    ProjectConfigViewComponent,
    ProjectDashboardComponent,
    ProjectItemViewComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatListModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatToolbarModule,
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
    ScrollingModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatSidenavModule,


  ],
  exports: [
  ],
  providers: [SnackbarComponent],
})
export class ProjectsModule { }
