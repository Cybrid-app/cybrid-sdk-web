import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';

import { Observable, map, pluck, take } from 'rxjs';

// Services
import { ConfigService } from '../../services/config/config.service';
import { AuthService } from '../../services/auth/auth.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { ErrorService, EventService } from '@services';

// Utility
import { Constants } from '@constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  CybridLogo =
    'https://assets-global.website-files.com/6226732e4130814a4adb86c2/62430bcedab2d5494d20b601_logo-white.svg';

  version: Observable<string> = new Observable<string>();

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private eventService: EventService,
    private errorService: ErrorService,
    private overlay: OverlayContainer,
    public configService: ConfigService
  ) {
    this.version = this.http.get(Constants.REPO_URL).pipe(
      pluck('tag_name'),
      map((tag) => tag as string)
    );
    // Set default light theme for Angular Material CDK backdrops
    this.overlay.getContainerElement().classList.add('cybrid-light-theme');
  }

  ngOnInit() {
    this.authService.restoreSession();
    this.errorService
      .getError()
      .pipe(
        map((err) => {
          const error = err.data ? err.data : err;
          console.log(error);
        })
      )
      .subscribe();
  }

  toggleTheme(): void {
    this.configService.config$
      .pipe(
        take(1),
        map((config) => {
          const container = this.overlay.getContainerElement();
          if (config.theme == 'DARK') {
            config.theme = 'LIGHT';
            container.classList.remove('cybrid-dark-theme');
            container.classList.add('cybrid-light-theme');
            this.configService.setConfig(config);
          } else {
            config.theme = 'DARK';
            container.classList.remove('cybrid-light-theme');
            container.classList.add('cybrid-dark-theme');
            this.configService.setConfig(config);
          }
        })
      )
      .subscribe();
  }

  logout(): void {
    this.authService.destroySession();
  }
}
