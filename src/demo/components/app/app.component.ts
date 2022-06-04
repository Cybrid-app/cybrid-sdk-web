import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, pluck } from 'rxjs';
import { ConfigService } from '../../services/config/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  version: Observable<string> = new Observable<string>();

  constructor(private http: HttpClient, public configService: ConfigService) {
    this.version = this.http
      .get(
        'https://api.github.com/repos/Cybrid-app/cybrid-sdk-web/releases/latest'
      )
      .pipe(
        pluck('tag_name'),
        map((tag) => tag as string)
      );
  }
}
