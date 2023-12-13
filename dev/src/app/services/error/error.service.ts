import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { CODE, ErrorLog } from 'library/src/shared/services';

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
