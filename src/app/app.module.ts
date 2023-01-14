import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { initializeApp } from "firebase/app"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthenticationModule } from './authentication/authentication.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProjectsModule } from './projects/projects.module';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from './services/data.service';
import { DialogsModule } from './dialogs/dialogs.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';



//initialize Firebase

const app = initializeApp(environment.firebase)

@NgModule({
  declarations: [
    AppComponent,
    SnackbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    AuthenticationModule,
    DashboardModule,
    DialogsModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTooltipModule,
    ProjectsModule,
    MatDividerModule,
    MatCardModule,


  ],
  providers: [SnackbarComponent, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
