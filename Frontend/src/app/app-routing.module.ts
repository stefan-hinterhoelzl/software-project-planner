import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { AuthguardService } from './services/authguard.service';
import { PreloadAllModules } from '@angular/router';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthguardService],
  },
  {
   path: '404',
   component: NotFoundComponent
  },

  {path: '500',
  component: ServerErrorComponent
  },

  //Lazy loaded project module

  {
      path: 'project',
      loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)
  },

  {path: '**',
   component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
