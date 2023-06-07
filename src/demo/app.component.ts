import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OverlayContainer } from '@angular/cdk/overlay';

import { map, take, switchMap, of } from 'rxjs';

// Services
import { ConfigService } from './services/config/config.service';
import { AuthService } from './services/auth/auth.service';

// Utility
import { Constants } from '@constants';
import { ComponentConfig } from '@services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  CybridLogo =
    'https://assets-global.website-files.com/6226732e4130814a4adb86c2/62430bcedab2d5494d20b601_logo-white.svg';

  version = this.http
    .get(Constants.REPO_URL)
    .pipe(map((tag) => Object(tag)['tag_name'] as string));

  constructor(
    private http: HttpClient,
    public configService: ConfigService,
    public authService: AuthService,
    private overlay: OverlayContainer
  ) {
    this.authService
      .restoreSession()
      .pipe(
        take(1),
        switchMap((session) =>
          session ? this.configService.getConfig() : of(session)
        )
      )
      .subscribe();

    // Set default light theme for Angular Material CDK backdrops
    this.overlay.getContainerElement().classList.add('cybrid-light-theme');
  }

  toggleTheme(config: ComponentConfig): void {
    const elements = [
      window.document.documentElement,
      this.overlay.getContainerElement()
    ];

    if (config.theme == 'DARK') {
      config.theme = 'LIGHT';
      elements.forEach((el) => {
        el.classList.remove('cybrid-dark-theme');
        el.classList.add('cybrid-light-theme');
      });
    } else {
      config.theme = 'DARK';
      elements.forEach((el) => {
        el.classList.remove('cybrid-light-theme');
        el.classList.add('cybrid-dark-theme');
      });
    }
    this.configService.setConfig(config);
  }

  logout(): void {
    this.authService.destroySession();
  }
}
