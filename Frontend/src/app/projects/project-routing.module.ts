import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthguardService } from "../services/authguard.service";
import { CreateProjectComponent } from "./create-project/create-project.component";
import { ProjectConfigViewComponent } from "./project-view/project-config-view/project-config-view.component";
import { ProjectDashboardComponent } from "./project-view/project-dashboard/project-dashboard.component";
import { ProjectItemOptionsComponent } from "./project-view/project-item-view/project-item-options/project-item-options.component";
import { ProjectItemViewComponent } from "./project-view/project-item-view/project-item-view.component";
import { ProjectListViewComponent } from "./project-view/project-item-view/project-list-view/project-list-view.component";
import { ProjectTreeViewComponent } from "./project-view/project-item-view/project-tree-view/project-tree-view.component";
import { ProjectViewComponent } from "./project-view/project-view/project-view.component";



const routes: Routes = [
    {
        path: 'create',
        component: CreateProjectComponent,
        canActivate: [AuthguardService],
    },
    {
        path: 'view/:projectId',
        component: ProjectViewComponent,
        canActivate: [AuthguardService],
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: ProjectDashboardComponent },
            { path: 'viewpoint/:viewpointId',
             component: ProjectItemViewComponent,
             children: [
              {path: '', redirectTo: 'list', pathMatch: 'full'},
              { path: 'list', component: ProjectListViewComponent },
              { path: 'tree', component: ProjectTreeViewComponent },
              { path: 'options', component: ProjectItemOptionsComponent},             ]
            },
            { path: 'config', component: ProjectConfigViewComponent },
        ],
    },
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
  export class ProjectRoutingModule {}
