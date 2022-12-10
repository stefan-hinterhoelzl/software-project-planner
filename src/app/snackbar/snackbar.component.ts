import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  timeOut = 5000;

  constructor(
    public snackBar: MatSnackBar
  ) { }

  openSnackBar(message: string, className: string = " ", action: string = " ") {
    return this.snackBar.open(message, action, {
      duration: this.timeOut,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: className,
    });
  }
}
