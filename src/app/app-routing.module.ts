import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { CreateProjectComponent } from './projects/create-project/create-project.component';
import { ProjectConfigViewComponent } from './projects/project-view/project-config-view/project-config-view.component';
import { ProjectListViewComponent } from './projects/project-view/project-list-view/project-list-view.component';
import { ProjectTreeViewComponent } from './projects/project-view/project-tree-view/project-tree-view.component';
import { ProjectViewComponent } from './projects/project-view/project-view/project-view.component';
import { AuthguardService } from './services/authguard.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthguardService],
  },
  {
    path: 'create-project/:id',
    component: CreateProjectComponent,
    canActivate: [AuthguardService],
  },
  {
    path: 'create-project',
    component: CreateProjectComponent,
    canActivate: [AuthguardService],
  },
  {
    path: 'project-view/:id',
    component: ProjectViewComponent,
    canActivate: [AuthguardService],
    children: [
      { path: '', redirectTo: 'tree', pathMatch: 'full' },
      { path: 'tree', component: ProjectTreeViewComponent },
      { path: 'list', component: ProjectListViewComponent },
      { path: 'config', component: ProjectConfigViewComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
