import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { CreateProjectComponent } from './projects/create-project/create-project.component';
import { ProjectViewComponent } from './projects/project-view/project-view/project-view.component';
import { AuthguardService } from './services/authguard.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthguardService] },
  { path: 'create-project/:id', component: CreateProjectComponent, canActivate: [AuthguardService] },
  { path: 'create-project', component: CreateProjectComponent, canActivate: [AuthguardService] },
  { path: 'project-view/:id', component: ProjectViewComponent, canActivate: [AuthguardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
