import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CODE, ErrorLog } from '@services';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private snackbar: MatSnackBar) {}

  handleError(error: ErrorLog): void {
    if (error.message == CODE.PERSONA_SDK_ERROR) {
      this.snackbar.open(
        'Persona SDK encountered an error, please refresh the component',
        'OK'
      );
    }
  }
}
