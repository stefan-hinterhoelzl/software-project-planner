import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectSearchComponent } from './project-search/project-search.component';
import { MatListModule } from '@angular/material/list';
import { CreateProjectComponent } from './create-project/create-project.component'



@NgModule({
  declarations: [
    ProjectSearchComponent,
    CreateProjectComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatListModule,
  ],
  exports: [
    ProjectSearchComponent
  ]
})
export class ProjectsModule { }