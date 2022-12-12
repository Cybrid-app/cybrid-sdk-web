import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OverlayContainer } from '@angular/cdk/overlay';

import { Observable, map, pluck, take } from 'rxjs';

import { DemoConfigService } from '../../services/demo-config/demo-config.service';

// Library
import { Constants } from '@constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  CybridLogo =
    'https://assets-global.website-files.com/6226732e4130814a4adb86c2/62430bcedab2d5494d20b601_logo-white.svg';

  version: Observable<string> = new Observable<string>();

  constructor(
    private http: HttpClient,
    public demoConfigService: DemoConfigService,
    private overlay: OverlayContainer
  ) {
    this.version = this.http.get(Constants.REPO_URL).pipe(
      pluck('tag_name'),
      map((tag) => tag as string)
    );
    // Set default light theme for Angular Material CDK backdrops
    this.overlay.getContainerElement().classList.add('cybrid-light-theme');
  }

  toggleTheme(): void {
    this.demoConfigService.config$
      .pipe(
        take(1),
        map((config) => {
          let newConfig = config;
          const container = this.overlay.getContainerElement();

          if (config.theme == 'DARK') {
            newConfig.theme = 'LIGHT';
            container.classList.remove('cybrid-dark-theme');
            container.classList.add('cybrid-light-theme');
            this.demoConfigService.config$.next(newConfig);
          } else {
            newConfig.theme = 'DARK';
            container.classList.remove('cybrid-light-theme');
            container.classList.add('cybrid-dark-theme');
            this.demoConfigService.config$.next(newConfig);
          }
        })
      )
      .subscribe();
  }
}
