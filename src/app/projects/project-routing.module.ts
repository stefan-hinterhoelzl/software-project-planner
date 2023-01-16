import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthguardService } from "../services/authguard.service";
import { CreateProjectComponent } from "./create-project/create-project.component";
import { ProjectConfigViewComponent } from "./project-view/project-config-view/project-config-view.component";
import { ProjectListViewComponent } from "./project-view/project-list-view/project-list-view.component";
import { ProjectTreeViewComponent } from "./project-view/project-tree-view/project-tree-view.component";
import { ProjectViewComponent } from "./project-view/project-view/project-view.component";



const routes: Routes = [
    {
        path: 'create/:id',
        component: CreateProjectComponent,
        canActivate: [AuthguardService],
    },
    {
        path: 'create',
        component: CreateProjectComponent,
        canActivate: [AuthguardService],
    },
    {
        path: 'view/:id',
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
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
  export class ProjectRoutingModule {}