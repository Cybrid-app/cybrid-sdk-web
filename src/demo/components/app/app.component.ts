import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  version: Observable<string> = new Observable<string>();

  constructor(
    private http: HttpClient,
    public demoConfigService: DemoConfigService
  ) {
    this.version = this.http.get(Constants.REPO_URL).pipe(
      pluck('tag_name'),
      map((tag) => tag as string)
    );
  }

  toggleTheme(): void {
    this.demoConfigService.config$.pipe(
      take(1),
      map((config) => {
        let newConfig = config;
        config.theme === 'LIGHT' ? newConfig.theme = 'DARK' : newConfig.theme = 'LIGHT'
            this.demoConfigService.config$.next(newConfig);
      })
    ).subscribe();
  }
}
