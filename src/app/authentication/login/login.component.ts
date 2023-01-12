import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

const googleLogoURL ="https://raw.githubusercontent.com/fireflysemantics/logo/master/Google.svg";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  auth = inject(AuthService);
  snackBar = inject(SnackbarComponent);
  matIconRegistry = inject(MatIconRegistry);
  domSanitizer = inject(DomSanitizer);



  constructor() {
    this.matIconRegistry.addSvgIcon("google_logo", this.domSanitizer.bypassSecurityTrustResourceUrl(googleLogoURL));
  }





  login() {
    this.auth.socialLogin();
  }



}



