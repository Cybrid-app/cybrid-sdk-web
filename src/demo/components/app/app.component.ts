import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, pluck } from 'rxjs';
import { ConfigService } from '../../services/config/config.service';
import { Constants } from '../../../../library/src/shared/constants/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  version: Observable<string> = new Observable<string>();
  mode: 'light_mode' | 'dark_mode' = 'light_mode';

  constructor(private http: HttpClient, public configService: ConfigService) {
    this.version = this.http.get(Constants.REPO_URL).pipe(
      pluck('tag_name'),
      map((tag) => tag as string)
    );
  }

  toggleTheme(): void {
    const config = this.configService.defaultConfig;
    switch (this.mode) {
      case 'light_mode': {
        this.mode = 'dark_mode';
        config.theme = 'DARK';
        this.configService.config$.next(config);
        break;
      }
      case 'dark_mode': {
        this.mode = 'light_mode';
        config.theme = 'LIGHT';
        this.configService.config$.next(config);
        break;
      }
    }
  }
}
