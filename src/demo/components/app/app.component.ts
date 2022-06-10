import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, pluck } from 'rxjs';
import { ConfigService } from '../../services/config/config.service';
import { Constants } from '../../../shared/constants/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  version: Observable<string> = new Observable<string>();

  constructor(private http: HttpClient, public configService: ConfigService) {
    this.version = this.http.get(Constants.REPO_URL).pipe(
      pluck('tag_name'),
      map((tag) => tag as string)
    );
  }
}
