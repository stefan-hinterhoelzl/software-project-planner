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
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,

  ],
  providers: [SnackbarComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
